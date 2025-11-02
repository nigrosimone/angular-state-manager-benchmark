import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addTodo } from './store/todo.actions';
import { TodoState } from './store/todo.reducer';
import { selectTodos } from './store/todo.selectors';

@Component({
  selector: 'app-root',
  template: `
  <input type="text" style="width: 50px;" [(ngModel)]="text" (keyup.enter)="doAddTodo()" />
  <span class="todos">{{todos().length}}</span>
  `,
  imports: [FormsModule],
})
export class App {
  private readonly store = inject(Store<{ todoState: TodoState }>);

  protected readonly text = signal<string>('');
  protected readonly todos = this.store.selectSignal(selectTodos);

  doAddTodo() {
    const text = this.text();
    if (text) {
      this.store.dispatch(addTodo({ text }));
      this.text.set('');
    }
  }
}
