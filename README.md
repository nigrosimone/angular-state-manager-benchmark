# AngularBenchmark

Small monorepo with two example of "Angular Counter App" demonstrating different state manager performance:

- `projects\angular` — Angular
- `projects\ngrx` — NgRx
- `projects\ngss` — NgSimpleState
- `projects\elf` — Elf
- `projects\ngxs` — NGXS
- `projects\akita` — Akita

## Quick start

1 Install dependencies

```shell
npm install
```

2 Run benchmark:

```shell
npm run benchmark:prod
```

3 Output

```shell
===== FINAL BENCHMARK =====
ngrx: avg=8471.50 ms (min=8301.70, max=8584.60, sd=133.74, long=0.0)
ngss: avg=8474.60 ms (min=8306.70, max=8598.30, sd=131.50, long=0.0)
elf: avg=8629.46 ms (min=8320.70, max=9052.80, sd=236.35, long=0.0)
ngxs: avg=8625.42 ms (min=8322.00, max=9035.40, sd=229.90, long=0.0)
akita: avg=8470.66 ms (min=8300.30, max=8585.60, sd=132.28, long=0.0)
angular: avg=8483.76 ms (min=8306.80, max=8601.80, sd=140.10, long=0.0)
Fastest: akita
Ratio: 1.02× (1.8% diff)
============================
```

## Add a new state manager

Add new Angular application

```shell
ng g application {state_manager_name}
```

Add `package.json` scripts

```shell
"start:{state_manager_name}": "ng serve {state_manager_name} --port {state_manager_port}",
"start:all": "npx concurrently -k \"npm run start:ngrx\" \"npm run start:ngss\" \"npm run start:{state_manager_name}\"",
```

```shell
"build:{state_manager_name}": "ng build {state_manager_name}",
"build:all": "npm run build:ngrx && npm run build:ngss && npm run build:{state_manager_name}"
```

```shell
"serve:{state_manager_name}": "http-server ./dist/{state_manager_name}/browser -p {state_manager_port}",
"serve:all": "npx concurrently -k \"npm run serve:ngrx\" \"npm run serve:{state_manager_name}\"",
```

```shell
"wait-on": "npx wait-on http://localhost:4200 http://localhost:4201 http://localhost:{state_manager_port}",
```

Update `cypress\e2e\benchmark.cy.ts`

```ts
// Map each library to its URL
const urlMap: Record<string, string> = {
  ngrx: 'http://localhost:4200',
  ngss: 'http://localhost:4201',
  {state_manager_name}: 'http://localhost:{state_manager_port}',
};
```

Implement `projects\{state_manager_name}\src\main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { Injectable, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ChangeDetectionStrategy, Component, Signal } from '@angular/core';


interface CounterState { count: number; }


@Component({
  selector: 'app-root',
  template: `
  <button (click)="doIncrement()">{{counter()}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
    // implement selector logic
    protected readonly counter: Signal<number>;

    doIncrement() {
        // implement increment logic
    }
}


bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
  ]
})
  .catch((err) => console.error(err));

```
