import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const rolesGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('rol'); // Usamos lo que guardó el AuthService

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Obtenemos los roles permitidos (configurados en app.routes.ts)
  const expectedRoles: string[] = route.data['roles'];

  // Si el rol del usuario está en la lista de permitidos
  if (expectedRoles && expectedRoles.includes(userRole || '')) {
    return true;
  }

  // Si no tiene permiso, lo mandamos al inicio (o una página 403)
  router.navigate(['/']); 
  return false;
};