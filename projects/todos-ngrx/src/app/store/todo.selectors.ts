import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TodoState } from './todo.reducer';

export const selectTodoState = createFeatureSelector<TodoState>('todoState');

export const selectTodos = createSelector(
  selectTodoState,
  (state: TodoState) => state.todos
);
