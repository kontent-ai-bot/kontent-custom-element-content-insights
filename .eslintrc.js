module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "@vue/prettier"],
  rules: {
    "no-undef": "warn",
    "no-console":
      "warn" /*process.env.NODE_ENV === "production" ? "error" : "warn",*/,
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  globals: {
    CustomElement: "on"
  }
};
