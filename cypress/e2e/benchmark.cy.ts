/// <reference types="cypress" />

const urlMap: Record<string, string> = {
  ngrx: 'http://localhost:4200',
  ngss: 'http://localhost:4201',
  elf: 'http://localhost:4202',
  ngxs: 'http://localhost:4203',
  akita: 'http://localhost:4204',
  angular: 'http://localhost:4205',
};

const NUM_CLICK = Number(Cypress.env('NUM_CLICK')) || 500;
const RUNS = Number(Cypress.env('RUNS')) || 5;
const LIBS = Object.keys(urlMap);

function simulateClicks(win: Window, button: HTMLButtonElement, n: number) {
  return new Cypress.Promise<{ duration: number; longTasks: number }>((resolve) => {
    let i = 0;
    const step = () => {
      if (button.innerText !== String(i)) {
        return win.requestAnimationFrame(step);
      }
      if (i++ >= n) return resolve();
      button.click();
      if (button.innerText === String(n)) {
        return resolve(); // no need to wait if updated immediately
      }
      if (button.innerText === String(i)) {
        return step(); // no need to wait if updated immediately
      }
      win.requestAnimationFrame(step);
    };
    step();
  });
}

function runBenchmarkOnce(lib: string): Cypress.Chainable<{ duration: number; longTasks: number }> {
  const url = urlMap[lib];
  if (!url) throw new Error(`No URL configured for ${lib}`);

  return cy.visit(url).then(() => {
    cy.contains('button', '0').should('be.visible');
    return cy.window().then((win) => {
      return new Cypress.Promise<{ duration: number; longTasks: number }>(async (resolve) => {
        win.performance.clearMarks();
        win.performance.clearMeasures();

        const button = win.document.querySelector('button') as HTMLButtonElement;
        if (!button) throw new Error('Button not found');
        if (button.innerText !== String(0)) {
          throw new Error(`Button click count mismatch: expected ${0}, got ${button.innerText}`);
        }
        if (win.document.title !== lib) {
          throw new Error(`Title: expected ${lib}, got ${win.document.title}`);
        }

        const now = Date.now();
        const startMark = `start-${lib}-${now}`;
        const endMark = `end-${lib}-${now}`;
        const measureName = `render-${lib}-${now}`;

        let longTasks = 0;
        const observer = new win.PerformanceObserver((list) => {
          longTasks += list.getEntries().filter((e) => e.entryType === 'longtask').length;
        });
        observer.observe({ entryTypes: ['longtask'] });

        win.performance.mark(startMark);

        simulateClicks(win, button, NUM_CLICK).then(() => {
          win.performance.mark(endMark);
          win.performance.measure(measureName, startMark, endMark);
          observer.disconnect();

          const measure = win.performance.getEntriesByName(measureName)[0];
          const duration = measure?.duration ?? 0;

          if (button.innerText !== String(NUM_CLICK)) {
            throw new Error(`Button click count mismatch: expected ${NUM_CLICK}, got ${button.innerText}`);
          }

          resolve({ duration, longTasks });
        })
      });
    });
  });
}

function runBenchmark(lib: string) {
  const results: number[] = [];
  const longTaskCounts: number[] = [];

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = (arr: number[]) => {
    const mean = avg(arr);
    return Math.sqrt(avg(arr.map((x) => (x - mean) ** 2)));
  };

  return cy.wrap(null).then(() => {
    const loop = (i: number): Cypress.Chainable => {
      if (i >= RUNS) {
        const summary = {
          lib,
          avg: avg(results),
          min: Math.min(...results),
          max: Math.max(...results),
          sd: std(results),
          avgLong: avg(longTaskCounts),
          results,
        };
        cy.writeFile(`cypress/results-${lib}.json`, summary);
        return cy.wrap(summary);
      }

      return runBenchmarkOnce(lib).then(({ duration, longTasks }) => {
        results.push(duration);
        longTaskCounts.push(longTasks);
        cy.log(`${lib} Run ${i + 1}: ${duration.toFixed(2)} ms (${longTasks} long tasks)`);
        return loop(i + 1);
      });
    };

    return loop(0);
  });
}

describe('Angular Store Benchmark', () => {
  LIBS.forEach((lib) => {
    it(`${lib} benchmark`, () => runBenchmark(lib));
  });

  it('Compare results', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: Record<string, any> = {};

    cy.wrap(LIBS).each((lib: string) => {
      cy.readFile(`cypress/results-${lib}.json`).then((data) => {
        results[lib] = data;
      })
    }).then(() => {
      const sorted = Object.entries(results).sort((a, b) => a[1].avg - b[1].avg);
      const [fastestLib, fastestData] = sorted[0];
      const [slowestLib, slowestData] = sorted[sorted.length - 1];

      const diff = slowestData.avg - fastestData.avg;
      const ratio = (slowestData.avg / fastestData.avg).toFixed(2);
      const percent = ((diff / slowestData.avg) * 100).toFixed(1);

      cy.log('--- Benchmark Results ---');
      sorted.forEach(([lib, data]) =>
        cy.log(`${lib}: avg=${data.avg.toFixed(2)} ms (±${data.sd.toFixed(2)}), longtasks=${data.avgLong.toFixed(1)}`)
      );
      cy.log(`${fastestLib} is fastest (${ratio}× faster than ${slowestLib}, ${percent}% diff)`);

      cy.writeFile('cypress/results-summary.json', {
        results,
        fastest: fastestLib,
        ratio,
        percent,
      });
    });
  });
});

after(() => {
  cy.readFile('cypress/results-summary.json').then((final) => {
    cy.task('log', `
===== FINAL BENCHMARK =====
${Object.entries(final.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map(([lib, d]: any) =>
          `${lib}: avg=${d.avg.toFixed(2)} ms (min=${d.min.toFixed(2)}, max=${d.max.toFixed(2)}, sd=${d.sd.toFixed(2)}, long=${d.avgLong.toFixed(1)})`
        )
        .join('\n')}
Fastest: ${final.fastest}
Ratio: ${final.ratio}× (${final.percent}% diff)
============================
      `);
  });
});

