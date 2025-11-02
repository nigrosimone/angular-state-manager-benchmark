import { createReducer, on } from '@ngrx/store';
import { addTodo } from './todo.actions';
import { Todo } from './todo.model';

export interface TodoState { todos: Todo[]; }

const initialState: TodoState = { todos: [] };

export const todoReducer = createReducer(
    initialState,
    on(addTodo, (state, { text }) => ({
        todos: [...state.todos, { text }]
    }))
);
