import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { jwtDecode } from 'jwt-decode';

export const rolesGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Decodificamos el token para ver el rol (el claim que configuramos en Java)
    const decoded: any = jwtDecode(token);
    const userRole = decoded.rol; // O el nombre que le hayas puesto en Java

    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token'); // Limpiamos token viejo
      router.navigate(['/login']);
      return false;
    }
    
    // Obtenemos los roles permitidos para esta ruta desde la configuración de rutas
    const expectedRoles: string[] = route.data['roles'];

    // Si el rol del usuario está en la lista de permitidos, puede pasar
    if (expectedRoles.includes(userRole)) {
      return true;
    }

    // Si tiene token pero no el rol adecuado, lo mandamos a una página de "No autorizado" o al Home
    router.navigate(['/home']);
    return false;

  } catch (error) {
    router.navigate(['/login']);
    return false;
  }
};