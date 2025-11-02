import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoStore } from './store/store';

@Component({
  selector: 'app-root',
  template: `
  <input type="text" style="width: 50px;" [(ngModel)]="text" (keyup.enter)="doAddTodo()" />
  <span class="todos">{{todos().length}}</span>
  `,
  imports: [FormsModule],
})
export class App {
  private readonly store = inject(TodoStore);

  protected readonly text = signal<string>('');
  protected readonly todos = this.store.selectTodos();

  doAddTodo() {
    const text = this.text();
    if (text) {
      this.store.addTodo(text);
      this.text.set('');
    }
  }
}
