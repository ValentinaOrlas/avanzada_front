import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { SolicitudService } from '../../../core/services/solictud.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClasificarSolicitud } from '../clasificar-solicitud/clasificar-solicitud.component';
import { AsignarResponsable } from '../asignar-responsable/asignar-responsable.component';
import { AtenderSolicitud } from '../atender-solicitud/atender-solicitud.component';
import { CancelarSolicitud } from '../cancelar-solicitud/cancelar-solicitud.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitud-detalle',
  standalone: true,
  imports: [
    CommonModule, DialogModule, TagModule, ButtonModule, DividerModule, FormsModule,
    TimelineModule, ClasificarSolicitud, AsignarResponsable, AtenderSolicitud, CancelarSolicitud
  ],
  templateUrl: './solicitud-detalle.html',
  styleUrl: './solicitud-detalle.css'
})
export class SolicitudDetalle implements OnChanges {
  private solicitudService = inject(SolicitudService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // <-- CORRECCIÓN: Inyección para controlar el ciclo de vida

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
  @Input() historial: any[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  observacionCierre: string = '';

  // Modales de acciones
  mostrarClasificar = false;
  mostrarAsignar = false;
  mostrarAtender = false;
  mostrarCancelar = false;
  mostrarCierre = false;

  // Getters de rol
  get rol(): string { return this.authService.getRole() ?? ''; }
  get esEstudiante(): boolean { return this.rol === 'ESTUDIANTE'; }
  get esAdmin(): boolean { return this.rol === 'ADMIN'; }
  get esCoordinador(): boolean { return this.rol === 'COORDINADOR'; }
  get esDocente(): boolean { return this.rol === 'DOCENTE'; }
  get puedeGestionar(): boolean { return !this.esEstudiante; }
  get puedeClasificar(): boolean { return this.esAdmin || this.esCoordinador; }
  get puedeAsignar(): boolean { return this.esAdmin || this.esCoordinador; }
  get puedeAtender(): boolean { return this.esAdmin || this.esDocente; }
  get puedeCancelar(): boolean {
    return this.esAdmin || 
           this.esCoordinador ||  // ← agregar
           (this.esEstudiante && this.solicitud?.estado === 'REGISTRADA');
}
  get puedeCerrar(): boolean { return this.esAdmin || this.esDocente; }

  getSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined {
    switch (estado) {
      case 'REGISTRADA':  return 'info';
      case 'CLASIFICADA': return 'warn';
      case 'EN_ATENCION': return 'warn';
      case 'ATENDIDA':    return 'success';
      case 'CERRADA':     return 'secondary';
      case 'CANCELADA':   return 'danger';
      default:            return 'contrast';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const abrioModal = changes['display']?.currentValue === true;
    const cambiaSolicitud = !!changes['solicitud'];

    if (this.solicitud?.codigo && this.display && (abrioModal || cambiaSolicitud)) {
      setTimeout(() => {
        const codigo = this.solicitud.codigo;

        // Carga en paralelo: detalle + historial
        this.solicitudService.obtenerPorId(codigo).subscribe({
          next: (res) => {
            const nombreDetectado =
              res?.solicitante?.nombre ||
              res?.solicitanteNombre   ||
              res?.usuarioNombre       ||
              this.solicitud?.solicitanteNombre ||
              'Usuario de la Plataforma';

            this.solicitud = { ...this.solicitud, ...res, solicitanteNombre: nombreDetectado };
            this.cdr.detectChanges();
          },
          error: () => this.cdr.detectChanges()
        });

        this.solicitudService.obtenerHistorial(codigo).subscribe({
          next: (eventos: any[]) => {
              console.log('HISTORIAL RAW:', JSON.stringify(eventos));
            if (eventos && eventos.length > 0) {
              this.historial = eventos.map(e => ({
                fecha:       e.fecha,
                accionTexto: this.textoAccion(e.tipoAccionHistorial || e.tipoAccion || e.accion),
                usuario:     e.usuario?.nombre || e.usuarioNombre || 'Sistema',
                observacion: e.observacion || '',
                icono:       this.iconoAccion(e.tipoAccionHistorial || e.tipoAccion || e.accion),
                color:       this.colorAccion(e.tipoAccionHistorial || e.tipoAccion || e.accion)
              }));
            } else {
              this.historial = this.historialFallback();
            }
            this.cdr.detectChanges();
          },
          error: () => {
            this.historial = this.historialFallback();
            this.cdr.detectChanges();
          }
        });
      }, 0);
    }
  }

  private historialFallback(): any[] {
    return [{
      fecha:       this.solicitud?.fechaCreacion || new Date(),
      accionTexto: 'Solicitud registrada',
      usuario:     this.solicitud?.solicitanteNombre || 'Sistema',
      observacion: 'La solicitud fue registrada en el sistema.',
      icono:       'pi pi-plus-circle',
      color:       '#3b82f6'
    }];
  }

  private textoAccion(tipo: string): string {
    const mapa: Record<string, string> = {
      REGISTRADA:  'Solicitud registrada',
      CLASIFICADA: 'Solicitud clasificada',
      ASIGNADA:    'Responsable asignado',
      EN_ATENCION: 'En atención',
      ATENDIDA:    'Solicitud atendida',
      CERRADA:     'Solicitud cerrada',
      CANCELADA:   'Solicitud cancelada'
    };
    return mapa[tipo] ?? (tipo ?? 'Acción realizada').replace(/_/g, ' ').toLowerCase();
  }

  private iconoAccion(tipo: string): string {
    const mapa: Record<string, string> = {
      REGISTRADA:  'pi pi-plus-circle',
      CLASIFICADA: 'pi pi-tag',
      ASIGNADA:    'pi pi-user-plus',
      EN_ATENCION: 'pi pi-spin pi-spinner',
      ATENDIDA:    'pi pi-check-circle',
      CERRADA:     'pi pi-lock',
      CANCELADA:   'pi pi-ban'
    };
    return mapa[tipo] ?? 'pi pi-circle';
  }

  private colorAccion(tipo: string): string {
    const mapa: Record<string, string> = {
      REGISTRADA:  '#3b82f6',
      CLASIFICADA: '#f59e0b',
      ASIGNADA:    '#8b5cf6',
      EN_ATENCION: '#f97316',
      ATENDIDA:    '#22c55e',
      CERRADA:     '#6b7280',
      CANCELADA:   '#ef4444'
    };
    return mapa[tipo] ?? '#6b7280';
  }

  cerrarDialogo() {
    this.display = false;
    this.mostrarCierre = false;
    this.mostrarClasificar = false;
    this.mostrarAsignar = false;
    this.mostrarAtender = false;
    this.mostrarCancelar = false;
    this.observacionCierre = '';
    this.onClose.emit();
  }

  onAccionCompletada() {
    this.onUpdate.emit();
    this.cerrarDialogo();
  }

  confirmarCierre() {
    if (!this.observacionCierre || this.observacionCierre.length < 10) {
      Swal.fire('Atención', 'La observación debe tener al menos 10 caracteres', 'warning');
      return;
    }

    const identificador = this.solicitud.id || this.solicitud.codigo;

    this.solicitudService.cerrarSolicitud(identificador, { observacion: this.observacionCierre }).subscribe({
      next: () => {
        Swal.fire('Cerrada', 'La solicitud ha sido cerrada exitosamente', 'success');
        this.observacionCierre = '';
        this.onAccionCompletada();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo cerrar', 'error')
    });
  }
}