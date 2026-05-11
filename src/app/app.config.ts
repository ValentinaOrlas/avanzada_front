import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Importación necesaria
import { authInterceptor } from './core/interceptors/auth/auth.interceptor';

// PrimeNG 21 Config
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(), // Habilita las animaciones que requiere PrimeNG
    providePrimeNG({ 
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.my-app-dark' // Opcional: para controlar el modo oscuro
            }
        }
    })
  ]
};