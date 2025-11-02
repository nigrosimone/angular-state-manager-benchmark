/// <reference types="cypress" />

const NUM_TODOS = 50_000;

function runBenchmark(lib: string) {
  cy.visit(lib === 'ngrx' ? 'http://localhost:4200' : 'http://localhost:4201');

  cy.get('button').should('contain.text', '0');

  // Execute synchronous clicks and performance measurement inside the page context
  cy.window().then((win) => {
    return new Cypress.Promise<{ duration: number }>((resolve) => {
      // Clear any previous marks/measures to avoid interference
      win.performance.clearMarks();
      win.performance.clearMeasures();

      const button = win.document.querySelector('button') as HTMLButtonElement | null;
      if (!button) {
        throw new Error('Could not find button on the page');
      }

      // Make unique mark names in case tests run multiple times in same session
      const now = Date.now();
      const startMark = `start-${lib}-${now}`;
      const endMark = `end-${lib}-${now}`;
      const measureName = `render-${lib}-${now}`;

      win.performance.mark(startMark);
      for (let i = 0; i < NUM_TODOS; i++) {
        // native DOM click — synchronous in page context
        button.click();
      }
      win.requestAnimationFrame(() => {
        if (button.innerText !== String(NUM_TODOS)) {
          throw new Error('Final button text does not match expected count');
        }
        win.performance.mark(endMark);
        win.performance.measure(measureName, startMark, endMark);

        const entries = win.performance.getEntriesByName(measureName);
        const m = entries && entries[0];
        const duration = m ? m.duration : 0;

        // Return duration and let Cypress handle assertions / file writes outside of raw page ops
        return resolve({ duration });
      });
    });

  }).then(({ duration }) => {
    // Assert that the button shows the expected number of todos (coerce to string)
    cy.get('button').should('contain.text', String(NUM_TODOS));

    cy.log(`${lib} render: ${duration.toFixed(2)} ms`);
    cy.writeFile(`cypress/results-${lib}.json`, { lib, duration });
  });
}

describe('Angular Store Benchmark', () => {
  it('NgRx', () => runBenchmark('ngrx'));
  it('NgSimpleState', () => runBenchmark('ngss'));

  it('Compare results', () => {
    cy.readFile('cypress/results-ngrx.json').then((ngrx) => {
      cy.readFile('cypress/results-ngss.json').then((ngss) => {
        const diff = ngss.duration - ngrx.duration;
        const faster = diff > 0 ? 'NgRx' : 'NgSimpleState';
        const slower = faster === 'NgRx' ? 'NgSimpleState' : 'NgRx';
        const percent = Math.abs(diff) / Math.max(ngrx.duration, ngss.duration) * 100;
        const ratio = (Math.max(ngrx.duration, ngss.duration) / Math.min(ngrx.duration, ngss.duration)).toFixed(2);

        cy.log(`NgRx: ${ngrx.duration.toFixed(2)} ms`);
        cy.log(`NgSimpleState: ${ngss.duration.toFixed(2)} ms`);
        cy.log(`${faster} is faster by ${Math.abs(diff).toFixed(2)} ms (${percent.toFixed(1)}%)`);
        cy.log(`${faster} is about ${ratio}× faster than ${slower}`);

        cy.writeFile(`cypress/results.json`, {
          NgRx: ngrx.duration.toFixed(2),
          NgSimpleState: ngss.duration.toFixed(2),
          faster,
          difference: Math.abs(diff).toFixed(2),
          percent: percent.toFixed(1),
          ratio,
        });
      });
    });
  });

  after(() => {
    cy.readFile('cypress/results.json').then((final) => {
      cy.task('log', `
NgRx: ${final.NgRx} ms
NgSimpleState: ${final.NgSimpleState} ms
${final.faster} faster than ${final.difference} ms (${final.percent}%)
${final.faster} is ${final.ratio}× faster
      `);
    });
  });
});
