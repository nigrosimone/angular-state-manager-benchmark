import { createAction, props } from '@ngrx/store';

export const addTodo = createAction('[Todo] Add', props<{ text: string }>());
