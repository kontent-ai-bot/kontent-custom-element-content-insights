<template>
  <v-layout>
    <v-flex>
      <v-list two-line>
        <v-subheader v-if="value && value.lastAnalyzed">
          <v-icon>label</v-icon>
          Last analyzed: {{ value.lastAnalyzed }}
        </v-subheader>
        <v-divider></v-divider>
        <v-subheader> <v-icon>alarm</v-icon>Reading Time: </v-subheader>
        <v-list-tile>
          <reading-time
            :content="content"
            :value="value ? value.readingTime : null"
            @save="setReadingTime"
          ></reading-time>
        </v-list-tile>
        <v-divider></v-divider>
        <v-card flat>
          <v-subheader> <v-icon>find_in_page</v-icon>Keywords: </v-subheader>
          <keywords
            :content="content"
            :maxKeywords="maxKeywords"
            :value="value ? value.keywords : null"
            @save="setKeywords"
          ></keywords>
        </v-card>
        <v-divider></v-divider>
        <v-subheader> <v-icon>mood</v-icon>Sentiment: </v-subheader>
        <v-list-tile>
          <sentiment :content="content" :value="value ? value.sentiment : null" @save="setSentiment"></sentiment>
        </v-list-tile>
        <v-divider></v-divider>
        <v-subheader> <v-icon>local_library</v-icon>Readability: </v-subheader>
        <v-list-tile>
          <readability
            :content="content"
            :value="value ? value.readability : null"
            @save="setReadability"
          ></readability>
        </v-list-tile>
        <v-divider v-if="showSuggestions"></v-divider>
        <v-subheader v-if="showSuggestions"> <v-icon>check_box</v-icon>Suggestions: </v-subheader>
      </v-list>
    </v-flex>
  </v-layout>
</template>
<script>
import Keywords from "./insights/Keywords";
import Sentiment from "./insights/Sentiment";
import ReadingTime from "./insights/ReadingTime";
import Readability from "./insights/Readability";

export default {
  props: ["content", "maxKeywords", "showSuggestions", "value"],
  components: {
    Keywords,
    Sentiment,
    ReadingTime,
    Readability,
  },
  watch: {
    content() {
      this.newValue = {
        keywords: null,
        readability: null,
        readingTime: null,
        sentiment: null,
      };
    },
  },
  data() {
    return {
      newValue: {},
    };
  },
  methods: {
    setKeywords(keywords) {
      this.newValue.keywords = keywords;
      this.checkNewValueReady();
    },
    setReadability(readability) {
      this.newValue.readability = readability;
      this.checkNewValueReady();
    },
    setReadingTime(readingTime) {
      this.newValue.readingTime = readingTime;
      this.checkNewValueReady();
    },
    setSentiment(sentiment) {
      this.newValue.sentiment = sentiment;
    },
    checkNewValueReady() {
      if (this.newValue.keywords && this.newValue.readingTime && this.newValue.readingTime && this.newValue.sentiment) {
        this.newValue.lastAnalyzed = new Date().toLocaleString();
        this.$eventBus.$emit("setValue", this.newValue);
      }
    },
  },
};
</script>
<style>
.v-icon {
  padding-right: 5px;
}
</style>
