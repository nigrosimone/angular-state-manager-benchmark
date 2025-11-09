# AngularBenchmark

Small monorepo with two example of "Angular Counter App" demonstrating different state manager performance:

- `projects\angular` — [Angular](https://angular.dev/)
- `projects\ngrx` — [NgRx](https://ngrx.io/)
- `projects\ngss` — [NgSimpleState](https://www.npmjs.com/package/ng-simple-state)
- `projects\elf` — [Elf](https://ngneat.github.io/elf/)
- `projects\ngxs` — [NGXS](https://www.ngxs.io/)
- `projects\akita` — [Akita](https://opensource.salesforce.com/akita/)

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
ngrx: avg=8481.94 ms (min=8293.70, max=8603.00, sd=138.12, long=0.0)
ngss: avg=8469.78 ms (min=8288.80, max=8589.70, sd=134.75, long=0.0)
elf: avg=8612.54 ms (min=8304.40, max=8988.40, sd=218.33, long=0.0)
ngxs: avg=8471.86 ms (min=8288.70, max=8598.00, sd=136.18, long=0.0)
akita: avg=8635.12 ms (min=8303.80, max=9088.80, sd=253.40, long=0.0)
angular: avg=8564.78 ms (min=8307.90, max=8745.80, sd=142.18, long=0.0)
Fastest: ngss
Ratio: 1.02× (1.9% diff)
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
