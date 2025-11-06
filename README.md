# AngularBenchmark

Small monorepo with two example of "Angular Counter App" demonstrating different state performance:

- `projects\ngrx` — Angular Counter App with NgRx state manager
- `projects\ngss` — Angular Counter App with NgSimpleState state manager
- `projects\elf` — Angular Counter App with Elf state manager
- `projects\ngxs` — Angular Counter App with NGXS state manager

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
ngrx: 595.40 ms
ngss: 44.00 ms
elf: 705.60 ms
ngxs: 182.60 ms
Fastest: ngss
Difference: 661.60 ms (93.8%)
Ratio: 16.04×
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
