import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { addTodo } from './store/todo.actions';
import { TodoState } from './store/todo.reducer';
import { selectTodos } from './store/todo.selectors';

@Component({
  selector: 'app-root',
  template: `
  <button (click)="doAddTodo()">{{todos().length}}</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly store = inject(Store<{ todoState: TodoState }>);

  protected readonly todos = this.store.selectSignal(selectTodos);

  doAddTodo() {
    this.store.dispatch(addTodo({ text: this.todos().length.toString() }));
  }
}
