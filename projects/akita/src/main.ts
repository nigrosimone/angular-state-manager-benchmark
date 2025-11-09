import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, ChangeDetectionStrategy, Component, provideBrowserGlobalErrorListeners, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Query, Store, StoreConfig } from '@datorama/akita';
import { Observable } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class CounterQuery extends Query<Counter> {
  public readonly count$: Observable<number>;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(protected override store: CounterStore) {
    super(store);
    this.count$ = this.select(state => state.count);
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
  private readonly query = inject(CounterQuery);
  private readonly store = inject(CounterStore);

  protected readonly count = toSignal(this.query.count$);

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
