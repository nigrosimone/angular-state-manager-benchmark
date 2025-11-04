import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ChangeDetectionStrategy, Component, provideBrowserGlobalErrorListeners } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createStore, withProps } from '@ngneat/elf';
import { select } from '@ngneat/elf';

interface Counter {
  count: number;
}

const counterStore = createStore(
  { name: 'counter' },
  withProps<Counter>({ count: 0 })
);

@Component({
  selector: 'app-root',
  template: `
    <button (click)="doIncrement()">{{ count() }}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

  protected readonly count = toSignal(counterStore.pipe(select((state) => state.count)));

  doIncrement() {
    counterStore.update((state) => ({
      count: state.count + 1,
    }));
  }
}

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection()
  ],
}).catch((err) => console.error(err));
