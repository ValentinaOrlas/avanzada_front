import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/solicitudes';

    listarMisSolicitudes(page: number = 1, size: number = 10): Observable<any> {
        const userId = localStorage.getItem('identificacion');
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (userId) params = params.set('solicitanteId', userId);

        return this.http.get<any>(this.API_URL, { params });
    }

    crearSolicitud(datos: any): Observable<any> {
        return this.http.post(this.API_URL, datos);
    }

    // En solicitud.service.ts añadir:
    getPrioridades(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/prioridades`);
    }

    getCanales(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/canales`);
    }

    getTipos(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/tipos`);
    }
}