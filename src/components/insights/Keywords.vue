<template>
  <v-flex>
    <v-chip
      v-for="(keyword, index) in keywords"
      :key="`${index}_keyword`"
      :small="true"
    >{{ keyword }}</v-chip>
  </v-flex>
</template>
<script>
import retext from "retext";
import keywords from "retext-keywords";
import toString from "nlcst-to-string";

export default {
  props: ["maxKeywords", "value"],
  data() {
    return {
      keywords: []
    };
  },
  created() {
    this.$eventBus.$on("newContentReady", this.analyzeContent);
  },
  watch: {
    value() {
      if (this.value) this.keywords = this.value;
    }
  },
  methods: {
    analyzeContent(content) {
      console.log(this.maxKeywords);
      this.keywords = this.extractPhrases(content).map(x => x.toLowerCase());
      this.$emit("save", this.keywords);
    },
    extractPhrases(text) {
      var result = [];
      retext()
        .use(keywords, { maximum: this.maxKeywords })
        .process(text, (err, file) => {
          if (err) this.$eventBus.$emit("error", err);

          file.data.keyphrases.forEach(phrase => {
            var k = phrase.matches[0].nodes.map(stringify).join("");
            function stringify(value) {
              return toString(value);
            }
            if (k.length > 3 && k != "&nbsp;") result.push(k);
          });
        });
      return result;
    }
  }
};
</script>
<style scoped>
div {
  margin-left: 15px;
}
</style>
