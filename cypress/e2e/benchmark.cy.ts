/// <reference types="cypress" />

// Number of times the button will be clicked in the benchmark
const NUM_CLICK = 10_000;

// Map each library to its URL
const urlMap: Record<string, string> = {
  ngrx: 'http://localhost:4200',
  ngss: 'http://localhost:4201',
  // add more libraries here
  // foo: 'http://localhost:4202',
};

// List of libraries to benchmark
const LIBS = Object.keys(urlMap);

/**
 * Run a benchmark for a specific library
 * @param lib Library name (must be defined in urlMap)
 */
function runBenchmark(lib: string) {

  const url = urlMap[lib];
  if (!url) throw new Error(`No URL configured for ${lib}`);

  // Visit the app page for this library
  cy.visit(url);

  // Ensure the initial button text is "0"
  cy.get('button').should('contain.text', '0');

  // Execute benchmark inside the page context
  cy.window().then((win) => {
    return new Cypress.Promise<{ duration: number }>((resolve) => {
      // Clear previous performance marks/measures to avoid interference
      win.performance.clearMarks();
      win.performance.clearMeasures();

      // Get the button element
      const button = win.document.querySelector('button') as HTMLButtonElement;
      if (!button) throw new Error('Button not found');

      // Create unique mark/measure names for this run
      const now = Date.now();
      const startMark = `start-${lib}-${now}`;
      const endMark = `end-${lib}-${now}`;
      const measureName = `render-${lib}-${now}`;

      // Start performance measurement
      win.performance.mark(startMark);

      // Click the button NUM_CLICK times synchronously
      for (let i = 0; i < NUM_CLICK; i++) {
        button.click();
      }

      // Function to finish measurement
      const finish = () => {
        // Verify final button count
        if (button.innerText !== String(NUM_CLICK)) {
          throw new Error('Final button text does not match expected count');
        }

        // Mark end of measurement
        win.performance.mark(endMark);

        // Measure the duration
        win.performance.measure(measureName, startMark, endMark);

        const entries = win.performance.getEntriesByName(measureName);
        const duration = entries?.[0]?.duration ?? 0;

        // Resolve promise with duration
        resolve({ duration });
      };

      // Schedule finish function for the next animation frame
      if (button.innerText === String(NUM_CLICK)) return finish();
      win.requestAnimationFrame(finish);
    });
  }).then(({ duration }) => {
    // Assert that the button shows the expected final count
    cy.get('button').should('contain.text', String(NUM_CLICK));

    // Log the result in Cypress
    cy.log(`${lib}: ${duration.toFixed(2)} ms`);

    // Save result to a JSON file
    cy.writeFile(`cypress/results-${lib}.json`, { lib, duration });
  });
}

describe('Angular Store Benchmark', () => {
  // Generate a benchmark test for each library dynamically
  LIBS.forEach((lib) => {
    it(`${lib} benchmark`, () => runBenchmark(lib));
  });

  // Compare all results after benchmarks
  it('Compare all results', () => {
    const results: Record<string, number> = {};

    cy.wrap(null).then(() => {
      // Read result files for all libraries
      return Cypress.Promise.map(LIBS, (lib) =>
        cy.readFile(`cypress/results-${lib}.json`).then((data) => {
          results[lib] = data.duration;
        })
      );
    }).then(() => {
      // Sort libraries by duration
      const entries = Object.entries(results);
      const sorted = entries.sort((a, b) => a[1] - b[1]);
      const [fastestLib, fastestTime] = sorted[0];
      const [slowestLib, slowestTime] = sorted[sorted.length - 1];

      const diff = slowestTime - fastestTime;
      const percent = (diff / slowestTime) * 100;
      const ratio = (slowestTime / fastestTime).toFixed(2);

      // Log results in Cypress
      cy.log('--- Benchmark Results ---');
      entries.forEach(([lib, duration]) => cy.log(`${lib}: ${duration.toFixed(2)} ms`));
      cy.log(`${fastestLib} is the fastest (${diff.toFixed(2)} ms faster, ${percent.toFixed(1)}%)`);
      cy.log(`${fastestLib} is about ${ratio}× faster than ${slowestLib}`);

      // Save comparison results to JSON
      cy.writeFile('cypress/results.json', {
        results,
        fastest: fastestLib,
        difference: diff.toFixed(2),
        percent: percent.toFixed(1),
        ratio,
      });
    });
  });

  // Log final summary after all tests
  after(() => {
    cy.readFile('cypress/results.json').then((final) => {
      cy.task('log', `
===== FINAL BENCHMARK =====
${Object.entries(final.results)
          .map(([lib, duration]) => `${lib}: ${Number(duration).toFixed(2)} ms`)
          .join('\n')}
Fastest: ${final.fastest}
Difference: ${final.difference} ms (${final.percent}%)
Ratio: ${final.ratio}×
============================
      `);
    });
  });
});
