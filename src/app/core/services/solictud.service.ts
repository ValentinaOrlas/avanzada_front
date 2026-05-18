import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, BehaviorSubject, of } from 'rxjs';

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
    const identificacion = localStorage.getItem('identificacion');

    if (!identificacion) {
        console.error('No se encontró identificación del docente.');
        return of([]);
    }

    let params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
        .set('responsableId', identificacion);

    return this.http.get<any>(this.API_URL, { params }).pipe(
        map(res => this.extractData(res)),
        tap(data => this.processResponse(data))
    );
}
    listarMisSolicitudes(page: number = 0, size: number = 10): Observable<any[]> {
        const email = localStorage.getItem('email') || this.getEmailFromToken();

        let params = new HttpParams()
            .set('page', (page + 1).toString())
            .set('size', size.toString());

        if (email) {
            params = params.set('email', email);
        }

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
        return this.http.post(this.API_URL, datos);
    }

    obtenerPorId(id: string): Observable<any> {
        return this.http.get<any>(`${this.API_URL}/${id}`);
    }

    /**
     * Obtiene el historial cronológico de acciones de una solicitud.
     * Mapea directamente al record Java 'EventoHistorialResponse'
     */
    obtenerHistorial(id: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.API_URL}/${id}/historial`);
    }

    atenderSolicitud(id: string, payload: any): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/atender`, payload);
    }

    cerrarSolicitud(id: string, request: { observacion: string }): Observable<any> {
        return this.http.put<any>(`${this.API_URL}/${id}/cerrar`, request);
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
            .set('page', page.toString())
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

    private getEmailFromToken(): string | null {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const candidate = payload.email || payload.correo || payload.mail ||
                (typeof payload.sub === 'string' && payload.sub.includes('@') ? payload.sub : null);
            return candidate || null;
        } catch {
            return null;
        }
    }

    sugerirClasificacion(descripcion: string, tipos: string[]): Observable<any> {
        return this.http.post(`${this.API_URL}/sugerir-clasificacion`, { descripcion, tipos });
    }

    // --- SELECTS ---
    getPrioridades() { return this.http.get<string[]>(`${this.API_URL}/prioridades`); }
    getCanales() { return this.http.get<string[]>(`${this.API_URL}/canales`); }
    getTipos() { return this.http.get<string[]>(`${this.API_URL}/tipos`); }
    obtenerSugerenciaIA(descripcion: string, tipos: string[]) {
        return this.http.post<{ sugerencia: string }>(`${this.API_URL}/sugerir`, { descripcion, tipos });
    }
}