import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { todoReducer } from './app/store/todo.reducer';

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom([
      StoreModule.forRoot({
        todoState: todoReducer
      })
    ])
  ]
})
  .catch((err) => console.error(err));
