import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, TokenResponse } from '../../models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth';

  // SIGNAL para el estado de autenticación (La clave de la reactividad)
  // Se inicializa verificando si ya existe un token
  public currentUser = signal<{ nombre: string, rol: string } | null>(this.getUserFromStorage());

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        // Guardamos en Storage
        localStorage.setItem('token', response.token);
        localStorage.setItem('rol', response.tipoUsuario);
        localStorage.setItem('nombre', response.nombre);
        
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        localStorage.setItem('identificacion', payload.sub);

        // Guardar el email: buscar en claims JWT, luego en la respuesta.
        // En Spring Security el sub suele ser el email institucional cuando
        // getUsername() devuelve email. Lo usamos como último recurso.
        const emailCandidate =
          payload.email    ||
          payload.correo   ||
          payload.mail     ||
          response.email   ||
          (typeof payload.sub === 'string' && payload.sub.includes('@') ? payload.sub : '');

        if (emailCandidate) localStorage.setItem('email', emailCandidate);

        // ACTUALIZAMOS EL SIGNAL (Esto avisará al Navbar automáticamente)
        this.currentUser.set({
          nombre: response.nombre,
          rol: response.tipoUsuario
        });
      })
    );
  }

  logout(): void {
    localStorage.clear(); // Limpia todo (token, rol, nombre)
    this.currentUser.set(null); // Notifica a toda la app que ya no hay usuario
  }

  // MÉTODOS DE APOYO PARA EL NAVBAR
  isLoggedIn(): boolean {
    return !!this.currentUser();
  }

  getRole(): string | null {
    return this.currentUser()?.rol || null;
  }

  getNombre(): string | null {
    return this.currentUser()?.nombre || null;
  }

  private getUserFromStorage() {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    return (nombre && rol) ? { nombre, rol } : null;
  }
}