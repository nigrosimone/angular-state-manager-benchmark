import { bootstrapApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';

interface CounterState { count: number; }

@Component({
  selector: 'app-root',
  template: `
  <button (click)="doIncrement()">{{counter()}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {

  protected readonly counterState = signal<CounterState>({ count: 0 });
  protected readonly counter = computed(() => this.counterState().count);

  doIncrement() {
    this.counterState.update(state => ({ count: state.count + 1 }));
  }
}


bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection()
  ]
})
  .catch((err) => console.error(err));
