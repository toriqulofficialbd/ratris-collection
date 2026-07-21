const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,
  env: {
    ADMIN_ACCESS_KEY: process.env.ADMIN_ACCESS_KEY || "",
  },

  e2e: {
    baseUrl: "http://localhost:3001",

    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
});