import { bootstrapApplication } from '@angular/platform-browser';
import { Injectable, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgSimpleStateBaseSignalStore, NgSimpleStateStoreConfig, provideNgSimpleState } from 'ng-simple-state';

interface CounterState { count: number; }

@Injectable()
export class CounterStore extends NgSimpleStateBaseSignalStore<CounterState> {

  storeConfig(): NgSimpleStateStoreConfig<CounterState> {
    return {
      storeName: 'CounterStore'
    };
  }

  initialState(): CounterState {
    return {
      count: 0
    };
  }

  selectCount() {
    return this.selectState(state => state.count);
  }

  increment() {
    this.setState(state => ({
      count: state.count + 1
    }));
  }

  override deepFreeze(state: CounterState): CounterState {
    // NB: Skip deep freeze for performance reasons. Ngrx does not deep freeze by default.
    return state;
  }
}

@Component({
  selector: 'app-root',
  template: `
  <button (click)="doIncrement()">{{counter()}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly store = inject(CounterStore);

  protected readonly counter = this.store.selectCount();

  doIncrement() {
    this.store.increment();
  }
}


bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgSimpleState({ enableDevTool: false }),
    CounterStore
  ]
})
  .catch((err) => console.error(err));
