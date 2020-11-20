<template>
  <v-container>
    <v-card>
      <v-card-text>
        <v-card-title><strong>Content Insights</strong></v-card-title>
        <insights :maxKeywords="maxKeywords" :showSuggestions="suggestions.length > 0" :value="value"></insights>
        <suggestions
          v-if="suggestions.length > 0"
          :suggestions="suggestions"
          :showLineNumbers="showLineNumbersInSuggestions"
        ></suggestions>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import Insights from "./Insights";
import Suggestions from "./Suggestions";

import DefaultSuggestions from "@/default-suggestions.js";
import { getElementValue } from "@/helpers/CustomElementHelper.js";
import RichTextClient from "@/clients/RichTextClient.js";

export default {
  props: ["element", "context", "value"],
  data() {
    return {
      suggestions: DefaultSuggestions,
      content: null,
      maxKeywords: 8,
      listeningTimeout: null,
      listeningTimeoutSeconds: 5,
    };
  },
  components: {
    Suggestions,
    Insights,
  },
  created() {
    this.$eventBus.$on("analyze", this.analyzeContent);
  },
  watch: {
    element(newVal) {
      this.listenForChanges();
      if (newVal.config.suggestions) {
        this.suggestions = newVal.config.suggestions;
      }
    },
  },
  computed: {
    showLineNumbersInSuggestions() {
      var elements = 0;
      if (this.element.config) {
        if (this.element.config.textElements) {
          elements += this.element.config.textElements.length;
        }
        if (this.element.config.richTextElements) {
          elements += this.element.config.richTextElements.length;
        }
      }

      if (elements > 1) return false;
      return true;
    },
  },
  methods: {
    elementChangedCallback(changedElements) {
      console.log(changedElements);
      if (this.listeningTimeout) {
        clearTimeout(this.listeningTimeout);
      }
      this.listeningTimeout = setTimeout(() => {
        this.$eventBus.$emit("analyze");
      }, this.listeningTimeoutSeconds * 1000);
      this.$eventBus.$emit("startLoading");
    },
    listenForChanges() {
      let codenames = [...this.getTextElementsCodenames(), ...this.getRichTextElementsCodenames()];
      CustomElement.observeElementChanges(codenames, this.elementChangedCallback);
      this.$eventBus.$emit("analyze");
    },
    async analyzeContent() {
      let textElementContent = await this.getTextElementContent();
      let richTextElementContent = await this.getRichTextElementContent();

      this.maxKeywords = this.getMaxKeywords();
      this.content = `${textElementContent} ${richTextElementContent}`;
      this.$nextTick(() => {
        this.$eventBus.$emit("newContentReady", this.content);
      });
    },
    getTextElementsCodenames() {
      if (this.element.config && this.element.config.textElements) {
        return this.element.config.textElements;
      }
      return [];
    },
    getRichTextElementsCodenames() {
      if (this.element.config && this.element.config.richTextElements && this.element.config.previewApiKey) {
        return this.element.config.richTextElements;
      }
      return [];
    },
    async getTextElementContent() {
      return await this.getTextElementsCodenames().reduce(async (previous, current) => {
        const aggregate = await previous;
        let elementValue = await getElementValue(current);
        return `${aggregate} ${elementValue}`;
      }, "");
    },
    async getRichTextElementContent() {
      var richTextClient = new RichTextClient(this.context.projectId, this.element.config.previewApiKey);
      return await this.getRichTextElementsCodenames().reduce(async (previous, current) => {
        const aggregate = await previous;
        try {
          let elementValue = await richTextClient.getRichTextValue(this.context.item.id, current);
          return `${aggregate} ${elementValue}`;
        } catch (error) {
          this.$eventBus.$emit("error", error);
          return `${aggregate}`;
        }
      }, "");
    },
    getMaxKeywords() {
      return this.element.config && this.element.config.maxKeywords ? this.element.config.maxKeywords : 8;
    },
  },
};
</script>
