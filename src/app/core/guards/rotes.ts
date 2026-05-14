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

  const expectedRoles: string[] = route.data['roles'];

  if (expectedRoles && expectedRoles.includes(userRole || '')) {
    return true;
  }

  router.navigate(['/']); 
  return false;
};