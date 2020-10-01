<template>
  <v-container>
    <v-card>
      <v-card-title>Content Insights</v-card-title>
      <v-card-text>
        <insights
          :maxKeywords="maxKeywords"
          :showSuggestions="suggestions.length > 0"
          :value="value"
        ></insights>
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
      maxKeywords: 8
    };
  },
  components: {
    Suggestions,
    Insights
  },
  created() {
    this.$eventBus.$on("analyze", this.analyzeContent);
  },
  watch: {
    element(newVal) {
      if (newVal.config.suggestions)
        this.suggestions = newVal.config.suggestions;
    }
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
    }
  },
  methods: {
    async analyzeContent() {
      let textElementContent = await this.getTextElementContent();
      let richTextElementContent = await this.getRichTextElementContent();

      this.maxKeywords = this.getMaxKeywords();
      this.content = `${textElementContent} ${richTextElementContent}`;
      this.$nextTick(() => {
        this.$eventBus.$emit("newContentReady", this.content);
      });
    },
    async getTextElementContent() {
      let textElementContent = "";
      if (this.element.config && this.element.config.textElements) {
        textElementContent = await this.element.config.textElements.reduce(
          async (previous, current) => {
            const aggregate = await previous;
            let elementValue = await getElementValue(current);
            return `${aggregate} ${elementValue}`;
          },
          ""
        );
      }
      return textElementContent;
    },
    async getRichTextElementContent() {
      let richTextElementContent = "";
      if (
        this.element.config &&
        this.element.config.richTextElements &&
        this.element.config.previewApiKey
      ) {
        var richTextClient = new RichTextClient(
          this.context.projectId,
          this.element.config.previewApiKey
        );
        richTextElementContent = await this.element.config.richTextElements.reduce(
          async (previous, current) => {
            const aggregate = await previous;
            try {
              let elementValue = await richTextClient.getRichTextValue(
                this.context.item.codename,
                current
              );
              return `${aggregate} ${elementValue}`;
            } catch (error) {
              this.$eventBus.$emit("error", error);
              return `${aggregate}`;
            }
          },
          ""
        );
      }
      return richTextElementContent;
    },
    getMaxKeywords() {
      return this.element.config && this.element.config.maxKeywords
        ? this.element.config.maxKeywords
        : 8;
    }
  }
};
</script>
