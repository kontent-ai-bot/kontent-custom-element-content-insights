<template>
  <v-app light>
    <v-layout column>
      <v-flex xs12 v-if="loading" class="pt-4">
        <h3 class="text-center">Analyzing...</h3>
        <v-progress-linear :indeterminate="true"></v-progress-linear>
      </v-flex>
      <v-flex xs12 v-if="error">
        <v-alert>{{ error }}</v-alert>
      </v-flex>
      <v-flex xs12 v-show="!loading && value">
        <content-analytics :element="element" :context="context" :value="value"></content-analytics>
      </v-flex>
    </v-layout>
  </v-app>
</template>
<script>
import ContentAnalytics from "./components/ContentAnalytics";

export default {
  name: "app",
  components: {
    ContentAnalytics,
  },
  data() {
    return {
      element: {},
      context: {},
      loading: true,
      error: null,
      value: null,
    };
  },
  created() {
    /* bind events */
    this.$eventBus.$on("stopLoading", () => {
      this.loading = false;
    });

    this.$eventBus.$on("startLoading", () => {
      this.loading = true;
    });

    this.$eventBus.$on("resize", this.updateSize);
    this.$eventBus.$on("error", this.catchError);
    this.$eventBus.$on("setValue", this.setValue);

    /* init custom element */
    try {
      CustomElement.init(this.initialize);
      CustomElement.onDisabledChanged(this.handleDisable);
    } catch (error) {
      this.error = error;
    }
  },
  methods: {
    initialize(element, context) {
      this.element = element;
      this.context = context;
      this.value = this.element.value ? JSON.parse(this.element.value) : null;
      this.loaded = true;
      this.updateSize();
      this.changeCursor(element.disabled);
      this.loading = false;
    },
    handleDisable(disableState) {
      this.changeCursor(disableState);
      this.element.disabled = disableState;
    },
    save(value) {
      // Explicitly using == to match both null and undefined
      const toSave = value == null ? null : JSON.stringify(value);
      this.element.value = toSave;
      CustomElement.setValue(toSave);
    },
    updateSize() {
      this.$nextTick(function () {
        const height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );

        CustomElement.setHeight(height);
      });
    },
    catchError(err) {
      this.error = err;
    },
    setValue(value) {
      this.value = value;
      this.save(value);
      this.loading = false;
      this.updateSize();
    },
    changeCursor(disabled) {
      if (disabled) document.body.style.cursor = "not-allowed";
      else document.body.style.cursor = "auto";
    },
  },
};
</script>

<style>
body {
  text-align: center;
  background-color: white !important;
}
#app {
  margin: 0px auto;
  text-align: left;
  background-color: white !important;
}
a {
  text-decoration: none !important;
}
a:hover {
  color: silver !important;
}
a:active,
a:focus {
  color: white !important;
}

button#analyze {
  width: 80%;
  margin: auto;
  margin-bottom: 5px;
  margin-top: 5px;
}

button#analyzeinput:not(disabled) {
  background-color: #0a68f5 !important;
}

#suggestions {
  margin-top: 0px;
  border: 0px;
}

.v-tabs__container {
  background-color: #6c6c6f !important;
}
.v-tabs__container a {
  border-bottom: 5px solid #0a68f5 !important;
}
</style>
<style scoped></style>
