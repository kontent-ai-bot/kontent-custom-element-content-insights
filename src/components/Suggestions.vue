<template>
  <v-layout row>
    <v-flex id="suggestions">
      <p v-if="!loaded" style="text-align: center"></p>
      <v-card v-if="loaded">
        <v-list dense>
          <v-list-group
            v-for="item in itemsFromConfig"
            :key="item.title"
            v-model="item.active"
            :prepend-icon="item.action"
          >
            <template v-slot:activator>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <strong>{{ item.title }}</strong>
                    <v-avatar
                      v-if="item.items.length > 0"
                      color="#f05a22"
                      size="20"
                      style="float: right; color: white"
                      >{{ item.items.length }}</v-avatar
                    >
                    <v-icon v-else style="float: right">check</v-icon>
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>

            <v-list-tile v-for="subItem in item.items" :key="subItem.title">
              <v-list-tile-content>
                <v-list-tile-title v-html="subItem.title"></v-list-tile-title>
              </v-list-tile-content>

              <v-list-tile-action>
                <v-icon :color="subItem.color">{{ subItem.action }}</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-group>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import * as SuggestionClient from "@/clients/SuggestionClient.js";

export default {
  props: ["suggestions", "showLineNumbers"],
  data() {
    return {
      loaded: false,
      items: [
        {
          action: "sync_problem",
          title: "Repeated Words",
          name: "repeated",
          items: [],
          active: true,
          method: async (content) => {
            this.populateMessages(0, await SuggestionClient.extractRepeatedWords(content));
          },
        },
        {
          action: "atm",
          title: "Redundant Acronyms",
          name: "acronyms",
          items: [],
          method: async (content) => {
            this.populateMessages(1, await SuggestionClient.extractAcronyms(content));
          },
        },
        {
          action: "headset_mic",
          title: "Passive Voice",
          name: "passive",
          items: [],
          method: async (content) => {
            this.populateMessagesWithActual(2, await SuggestionClient.extractPassive(content));
          },
        },
        {
          action: "speaker_notes_off",
          title: "Profanities",
          name: "profanities",
          items: [],
          method: async (content) => {
            this.populateMessages(3, await SuggestionClient.extractProfanities(content));
          },
        },
        {
          action: "mood_bad",
          title: "Insensitive or inconsiderate language",
          name: "insensitive",
          items: [],
          method: async (content) => {
            this.populateMessages(4, await SuggestionClient.extractEquality(content));
          },
        },
        {
          action: "brightness_6",
          title: "Weak and mitigating wording",
          name: "weak",
          items: [],
          method: async (content) => {
            this.populateMessages(5, await SuggestionClient.extractIntensify(content));
          },
        },
      ],
    };
  },
  computed: {
    itemsFromConfig() {
      return this.items.filter((i) => this.suggestions.includes(i.name));
    },
  },
  created() {
    this.$eventBus.$on("newContentReady", this.analyzeContent);
  },
  methods: {
    async analyzeContent(content) {
      this.loaded = true;
      for (let i = 0, suggestion; (suggestion = this.itemsFromConfig[i]); i++) {
        try {
          await suggestion.method(content);
        } catch (err) {
          this.$eventBus.$emit("error", err);
        }
      }
    },
    populateMessagesWithActual(index, messages) {
      let consolidated = this.consolidateMessages(messages);
      for (let i = 0, message; (message = consolidated[i]); i++) {
        let title = `${message.message} in <em><strong>${message.actual}</strong></em>`;
        if (this.showLineNumbers) title += ` on line(s) <strong>${message.lines.join(", ")}</strong>`;

        let item = {
          title: title,
          action: "warning",
          color: "#f05a22",
          actual: message.actual,
        };

        if (message.chunks) item.chunks = message.chunks;
        this.pushItem(index, item);
      }
    },
    populateMessages(index, messages) {
      let consolidated = this.consolidateMessages(messages);
      for (let i = 0, message; (message = consolidated[i]); i++) {
        let title = `${message.message}`;
        if (this.showLineNumbers) title += ` on line(s) <strong>${message.lines.join(", ")}</strong>`;

        let item = {
          title: title,
          action: "warning",
          color: "#f05a22",
          actual: message.actual,
        };
        this.pushItem(index, item);
      }
    },
    consolidateMessages(messages) {
      let consolidated = [];
      for (let i = 0, message; (message = messages[i]); i++) {
        let found = consolidated.filter((x) => x.actual.toLowerCase() == message.actual.toLowerCase());
        if (found.length == 0) {
          let consolidatedItem = {
            actual: message.actual.toLowerCase(),
            message: message.message,
            lines: [message.line],
          };

          if (message.chunk) consolidatedItem.chunks = [message.chunk];
          consolidated.push(consolidatedItem);
        } else {
          if (!found[0].lines.includes(message.line)) found[0].lines.push(message.line);
          if (message.chunk) found[0].chunks.push(message.chunk);
        }
      }
      return consolidated;
    },
    pushItem(index, item) {
      let found = this.items[index].items.filter((i) => i.title == item.title);
      if (found.length == 0) this.items[index].items.push(item);
    },
    resize() {
      setTimeout(() => {
        this.$eventBus.$emit("resize");
      }, 300);
    },
  },
};
</script>
<style>
#suggestions {
  margin-top: 10px;
}
</style>
