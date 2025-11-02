/// <reference types="cypress" />

const NUM_TODOS = 500;

function runBenchmark(lib: string) {
  cy.visit(lib === 'ngrx' ? 'http://localhost:4200' : 'http://localhost:4201');

  cy.window().then((win) => {

    const todoInput = cy.get('button');

    win.performance.mark('start');
    for (let i = 0; i < NUM_TODOS; i++) {
      todoInput.click();
    }
    win.performance.mark('end');
    win.performance.measure('render', 'start', 'end');
    const m = win.performance.getEntriesByName('render')[0];

    todoInput.should('contain.text', NUM_TODOS);

    cy.log(`${lib} render: ${m.duration.toFixed(2)} ms`);
    cy.writeFile(`cypress/results-${lib}.json`, { lib, duration: m.duration });
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
        const percent = Math.abs(diff) / Math.max(ngrx.duration, ngss.duration) * 100;

        cy.log(`NgRx: ${ngrx.duration.toFixed(2)} ms`);
        cy.log(`NgSimpleState: ${ngss.duration.toFixed(2)} ms`);
        cy.log(`${faster} is faster by ${Math.abs(diff).toFixed(2)} ms (${percent.toFixed(1)}%)`);
        cy.writeFile(`cypress/results.json`, {
          NgRx: ngrx.duration.toFixed(2),
          NgSimpleState: ngss.duration.toFixed(2),
          faster,
          difference: Math.abs(diff).toFixed(2),
          percent: percent.toFixed(1),
        });
      });
    });
  });
});
