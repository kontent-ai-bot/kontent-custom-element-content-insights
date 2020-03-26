<template>
  <v-flex>
    <strong>{{ readingTime.time }}</strong>
    <em>({{ readingTime.words }} words)</em>
  </v-flex>
</template>
<script>
import readingTime from "reading-time";

export default {
  props: ["content", "value"],
  data() {
    return {
      readingTime: {
        time: 0,
        words: 0
      }
    };
  },
  watch: {
    value() {
      if (this.value) this.readingTime = this.value;
    }
  },
  created() {
    this.$eventBus.$on("newContentReady", this.analyzeContent);
  },
  methods: {
    analyzeContent(content) {
      let rt = this.countReadingTime(content);
      this.readingTime = {
        time: rt.text,
        words: rt.words
      };

      this.$emit("save", this.readingTime);
    },
    countReadingTime(text) {
      return readingTime(text);
    }
  }
};
</script>
<style scoped>
div {
  margin-left: 15px;
}
em {
  margin-left: 10px;
}
</style>
