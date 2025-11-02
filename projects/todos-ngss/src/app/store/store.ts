import { Injectable } from '@angular/core';
import { NgSimpleStateBaseSignalStore, NgSimpleStateStoreConfig } from 'ng-simple-state';

export interface Todo {
  text: string;
}

export interface TodoState { todos: Todo[]; }
 
@Injectable()
export class TodoStore extends NgSimpleStateBaseSignalStore<TodoState> {

  storeConfig(): NgSimpleStateStoreConfig<TodoState> {
    return {
      storeName: 'TodoStore'
    };
  }
  
  initialState(): TodoState {
    return {
        todos: []
    };
  }

  selectTodos() {
    return this.selectState(state => state.todos);
  }

  addTodo(text: string) {
    this.setState(state => ({
      todos: [...state.todos, { text }]
    }));
  }
}