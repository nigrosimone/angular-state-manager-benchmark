import { bootstrapApplication } from '@angular/platform-browser';
import { Injectable, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { NgSimpleStateBaseSignalStore, NgSimpleStateStoreConfig, provideNgSimpleState } from 'ng-simple-state';

interface CounterState { count: number; }

@Injectable()
export class CounterStore extends NgSimpleStateBaseSignalStore<CounterState> {

  override devMode = false; // force devMode also in development for demonstration

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

  protected readonly counter: Signal<number> = this.store.selectState(state => state.count);

  doIncrement() {
    this.store.replaceState(state => ({
      count: state.count + 1
    }), 'increment');
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
