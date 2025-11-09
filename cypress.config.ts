import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 20000,
  numTestsKeptInMemory: 0,
  video: false,
  screenshotOnRunFailure: false,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
    },
  },
});


