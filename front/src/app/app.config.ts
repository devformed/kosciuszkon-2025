import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
    provideHttpClient(),
  ],
};
