import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 20000,
  numTestsKeptInMemory: 0,
  video: false,
  screenshotOnRunFailure: false,
  retries: 0,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });
      on('before:browser:launch', (browser, launchOptions) => {
        if ((browser?.name === 'chrome' || browser?.name === 'electron') && launchOptions?.args) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions
      })
    },
  },
});


