import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ChangeDetectionStrategy, Component, provideBrowserGlobalErrorListeners, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store, StoreConfig } from '@datorama/akita';

interface Counter {
  count: number;
}


@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'session' })
export class CounterStore extends Store<Counter> {
  constructor() {
    super({
      count: 0
    });
  }
}

@Component({
  selector: 'app-root',
  template: `
    <button (click)="doIncrement()">{{ count() }}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {

  private readonly store = inject(CounterStore);

  protected readonly count = toSignal(this.store._select(state => state.count));

  doIncrement() {
    this.store.update(state => ({
      count: state.count + 1
    }));
  }
}

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection()
  ],
}).catch((err) => console.error(err));
