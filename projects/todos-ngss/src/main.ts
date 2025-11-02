import { bootstrapApplication } from '@angular/platform-browser';
import { provideNgSimpleState } from 'ng-simple-state';
import { App } from './app/app';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { TodoStore } from './app/store/store';

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideNgSimpleState({ enableDevTool: false }),
    TodoStore
  ]
})
  .catch((err) => console.error(err));
