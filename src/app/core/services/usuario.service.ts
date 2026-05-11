import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrearUsuarioRequest, DetalleUsuarioResponse } from '../../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/usuarios';

  registrar(usuario: CrearUsuarioRequest): Observable<DetalleUsuarioResponse> {
    return this.http.post<DetalleUsuarioResponse>(this.API_URL, usuario);

  }

  registrarPersonal(usuario: CrearUsuarioRequest): Observable<DetalleUsuarioResponse> {
    return this.http.post<DetalleUsuarioResponse>(`${this.API_URL}/admin/crear-personal`, usuario);
  }

  getTiposDocumento(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/tipos-documento`);
  }

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/roles`);
  }

  obtenerDetallePropio(): Observable<DetalleUsuarioResponse> {

    return this.http.get<DetalleUsuarioResponse>(`${this.API_URL}/me`);
  }
}