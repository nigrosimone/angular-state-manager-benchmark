import { Component, inject } from '@angular/core';
import { TodoStore } from './store/store';

@Component({
  selector: 'app-root',
  template: `
  <button (click)="doAddTodo()">{{todos().length}}</button>
  `
})
export class App {
  private readonly store = inject(TodoStore);

  protected readonly todos = this.store.selectTodos();

  doAddTodo() {
    this.store.addTodo(this.todos().length.toString());
  }
}
