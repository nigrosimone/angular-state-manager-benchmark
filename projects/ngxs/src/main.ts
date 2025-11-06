import { ChangeDetectionStrategy, Component, inject, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Action, provideStore, Selector, State, StateContext, Store } from '@ngxs/store';

interface Counter {
  count: number;
}

export class Increment {
  static readonly type = 'Increment';
}

@State<Counter>({
  name: 'counter',
  defaults: { count: 0 },
})
export class CounterState {

  @Selector()
  static count(state: Counter): number {
    return state.count;
  }

  @Action(Increment)
  increment(ctx: StateContext<Counter>) {
    const state = ctx.getState();
    ctx.setState({ count: state.count + 1 });
  }
}

@Component({
  selector: 'app-root',
  template: `
    <button (click)="doIncrement()">{{ counter() }}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly store = inject(Store);

  protected readonly counter = this.store.selectSignal<number>(CounterState.count);

  doIncrement() {
    this.store.dispatch(new Increment());
  }
}

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideStore([CounterState]),
  ]
}).catch((err) => console.error(err));
