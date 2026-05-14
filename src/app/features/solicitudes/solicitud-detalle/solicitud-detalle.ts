import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
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
    ClasificarSolicitud, AsignarResponsable, AtenderSolicitud, CancelarSolicitud
  ],
  templateUrl: './solicitud-detalle.html'
})
export class SolicitudDetalle {
  private solicitudService = inject(SolicitudService);
  private authService = inject(AuthService);

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
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
  get puedeCancelar(): boolean { return this.esAdmin; }
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

  ngOnChanges() {
  if (this.solicitud?.codigo && this.display) {
    this.solicitudService.obtenerPorId(this.solicitud.codigo).subscribe({
      next: (res) => this.solicitud = res,
      error: (err) => console.error('Error cargando detalle', err)
    });
  }
}

  cerrarDialogo() {
    this.display = false;
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
    this.solicitudService.cerrarSolicitud(this.solicitud.codigo, { observacion: this.observacionCierre }).subscribe({
      next: () => {
        Swal.fire('Cerrada', 'La solicitud ha sido cerrada exitosamente', 'success');
        this.observacionCierre = '';
        this.onAccionCompletada();
      },
      error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo cerrar', 'error')
    });
  }
}