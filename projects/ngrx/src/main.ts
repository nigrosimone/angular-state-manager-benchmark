import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StoreModule, Store, createAction, createReducer, on, createFeatureSelector, createSelector } from '@ngrx/store';

interface Counter {
  count: number;
}

const increment = createAction('[Counter] Increment');

const initialState: Counter = { count: 0 };

const counterReducer = createReducer(
  initialState,
  on(increment, (state) => ({ count: state.count + 1 }))
);

const selectCounter = createFeatureSelector<Counter>('counter');

const selectCount = createSelector(
  selectCounter,
  (state: Counter) => state.count
);

@Component({
  selector: 'app-root',
  template: `
    <button (click)="doIncrement()">{{ counter() }}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly store = inject(Store<{ counter: Counter }>);

  protected readonly counter = this.store.selectSignal(selectCount);

  doIncrement() {
    this.store.dispatch(increment());
  }
}

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom([
      StoreModule.forRoot({
        counter: counterReducer
      })
    ])
  ]
}).catch((err) => console.error(err));
