<template>
  <v-flex>
    <i class="em em-slightly_smiling_face" v-if="sentiment.valence == 'positive'"></i>
    <i class="em em-white_frowning_face" v-else-if="sentiment.valence == 'negative'"></i>
    <i class="em em-neutral_face" v-else></i>

    <strong>{{ sentiment.valence }}</strong>
    <em>({{ sentiment.polarWords }} words with polarity)</em>
  </v-flex>
</template>
<script>
import unified from "unified";
import english from "retext-english";
import sentiment from "retext-sentiment";
import size from "unist-util-size";
import filter from "unist-util-filter";

export default {
  props: ["content", "value"],
  data() {
    return {
      sentiment: {
        polarity: 0,
        valence: "",
        polarWords: 0
      }
    };
  },
  watch: {
    value() {
      if (this.value) this.sentiment = this.value;
    }
  },
  created() {
    this.$eventBus.$on("newContentReady", this.analyzeContent);
  },
  methods: {
    analyzeContent(content) {
      this.sentiment = this.extractSentiment(content);
      this.$emit("save", this.sentiment);
    },
    extractSentiment(text) {
      var processor = unified()
        .use(english)
        .use(sentiment);

      let tree = processor.parse(text);
      processor.run(tree, text);

      return {
        polarity: tree.data.polarity,
        valence: tree.data.valence,
        polarWords: size(filter(tree, node => (node.type = "WordNode" && node.data)))
      };
    }
  }
};
</script>
<style scoped>
div {
  margin-left: 15px;
}
strong {
  margin-left: 5px;
}
span {
  margin-left: 10px;
}
em {
  padding-left: 2px;
  padding-right: 2px;
}
</style>
