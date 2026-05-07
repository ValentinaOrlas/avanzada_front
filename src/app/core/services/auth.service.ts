import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, TokenResponse } from '../../models/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 1. Inyección de dependencias moderna (Guía Pág. 6)
  private http = inject(HttpClient);
  
  // 2. URL de tu API en Spring Boot
  private readonly API_URL = 'http://localhost:8080/api/auth';

  // 3. Método de Login (Guía Pág. 30)
  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
      })
    );
  }

  // Métodos de apoyo recomendados
  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}