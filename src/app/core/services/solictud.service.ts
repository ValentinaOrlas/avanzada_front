import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, BehaviorSubject, of } from 'rxjs'; // Se agregó 'of'

@Injectable({
    providedIn: 'root'
})
export class SolicitudService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/solicitudes';

    public totalPendientes = signal<number>(0);
    private solicitudesSubject = new BehaviorSubject<any[]>([]);
    public solicitudes$ = this.solicitudesSubject.asObservable();

    // --- MÉTODOS DE LISTADO ---

    /** * Para el Docente: Lista SOLO las solicitudes donde es RESPONSABLE 
     */
    listarAsignadas(page: number = 1, size: number = 10): Observable<any[]> {
        const userId = this.getIdFromToken();
        
        if (!userId) {
            console.error('No se encontró ID de usuario para filtrar asignaciones');
            return of([]);
        }

        const params = this.getParams(page, size, 'responsableId', userId);

        return this.http.get<any>(this.API_URL, { params }).pipe(
            map(res => this.extractData(res)),
            tap(data => this.processResponse(data))
        );
    }

    /** * Para el Usuario: Lista solicitudes que el usuario CREÓ 
     */
    listarMisSolicitudes(page: number = 1, size: number = 10): Observable<any[]> {
        const userId = this.getIdFromToken();
        const params = this.getParams(page, size, 'solicitanteId', userId);

        return this.http.get<any>(this.API_URL, { params }).pipe(
            map(res => this.extractData(res)),
            tap(data => this.processResponse(data))
        );
    }

    /** * Para el Administrador: Lista TODO sin filtros
     */
    listarTodas(page: number = 1, size: number = 50): Observable<any[]> {
        const params = this.getParams(page, size);

        return this.http.get<any>(this.API_URL, { params }).pipe(
            map(res => this.extractData(res)),
            tap(data => this.processResponse(data))
        );
    }

    // --- OPERACIONES ---

    crearSolicitud(datos: any): Observable<any> {
        return this.http.post(this.API_URL, datos).pipe(
            tap(() => this.listarMisSolicitudes().subscribe())
        );
    }

    obtenerPorId(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/${id}`);
    }

    atenderSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/atender`, payload);
    }

    cerrarSolicitud(id: string, request: { observacion: string }): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/cerrar`, request).pipe(
            tap(() => this.listarMisSolicitudes().subscribe())
        );
    }

    asignarResponsable(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/asignar`, payload);
    }

    clasificarSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/clasificar`, payload);
    }

    cancelarSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/cancelar`, payload);
    }

    // --- UTILIDADES DE APOYO ---

    private getParams(page: number, size: number, filterKey?: string, filterValue?: string | null): HttpParams {
        let params = new HttpParams()
            .set('page', (page - 1).toString()) 
            .set('size', size.toString());

        if (filterKey && filterValue) {
            params = params.set(filterKey, filterValue);
        }
        return params;
    }

    private extractData(res: any): any[] {
        return res?.content || res?.contenido || (Array.isArray(res) ? res : []);
    }

    private processResponse(data: any[]): void {
        this.solicitudesSubject.next(data);
        const pendientes = data.filter((s: any) =>
            s.estado !== 'CERRADA' && s.estado !== 'CANCELADA'
        ).length;
        this.totalPendientes.set(pendientes);
    }

    private getIdFromToken(): string | null {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId || payload.sub || null;
        } catch {
            return null;
        }
    }

    // --- SELECTS ---
    getPrioridades() { return this.http.get<string[]>(`${this.API_URL}/prioridades`); }
    getCanales() { return this.http.get<string[]>(`${this.API_URL}/canales`); }
    getTipos() { return this.http.get<string[]>(`${this.API_URL}/tipos`); }
    obtenerSugerenciaIA(descripcion: string, tipos: string[]) {
        return this.http.post<{ sugerencia: string }>(`${this.API_URL}/sugerir`, { descripcion, tipos });
    }
}