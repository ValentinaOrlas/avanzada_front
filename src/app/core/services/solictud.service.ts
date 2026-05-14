import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, BehaviorSubject } from 'rxjs'; // ← agrega map

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/solicitudes';

    public totalPendientes = signal<number>(0);

    private solicitudesSubject = new BehaviorSubject<any[]>([]);
    public solicitudes$ = this.solicitudesSubject.asObservable();

    listarMisSolicitudes(page: number = 1, size: number = 10): Observable<any[]> {
        const userId = this.getIdFromToken();

        let params = new HttpParams()
            .set('page', page.toString())  // ← ahora envía 1 en vez de 0
            .set('size', size.toString());

        if (userId) params = params.set('solicitanteId', userId);

        return this.http.get<any>(this.API_URL, { params }).pipe(
            map(res => {
                const data: any[] = Array.isArray(res) ? res : (res?.contenido || []);
                return data;
            }),
            tap(data => {
                this.solicitudesSubject.next(data);
                const pendientes = data.filter((s: any) =>
                    s.estado !== 'CERRADA' && s.estado !== 'CANCELADA'
                ).length;
                this.totalPendientes.set(pendientes);
            })
        );
    }

    crearSolicitud(datos: any): Observable<any> {
        return this.http.post(this.API_URL, datos).pipe(
            tap(() => this.listarMisSolicitudes().subscribe())
        );
    }

    listarTodas(page: number = 1, size: number = 50): Observable<any[]> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        // ← sin solicitanteId para traer todas

        return this.http.get<any>(this.API_URL, { params }).pipe(
            map(res => {
                const data: any[] = Array.isArray(res) ? res : (res?.contenido || []);
                return data;
            }),
            tap(data => {
                this.solicitudesSubject.next(data);
                const pendientes = data.filter((s: any) =>
                    s.estado !== 'CERRADA' && s.estado !== 'CANCELADA'
                ).length;
                this.totalPendientes.set(pendientes);
            })
        );
    }

    obtenerPorId(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/${id}`);
    }

    cerrarSolicitud(id: string, request: { observacion: string }): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/cerrar`, request).pipe(
            tap(() => this.listarMisSolicitudes().subscribe())
        );
    }

    atenderSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/atender`, payload);
    }

    cancelarSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/cancelar`, payload);
    }

    asignarResponsable(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/asignar`, payload);
    }
    clasificarSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/clasificar`, payload);
    }

    getPrioridades(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/prioridades`);
    }

    getCanales(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/canales`);
    }

    getTipos(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API_URL}/tipos`);
    }

    private getIdFromToken(): string | null {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || null;
        } catch {
            return null;
        }
    }
}