import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { SolicitudCrear } from '../../../features/solicitudes/solicitud-crear/solicitud-crear';
import { SolicitudLista } from '../../../features/solicitudes/solicitud-lista/solicitud-lista';
import { SolicitudDetalle } from '../../../features/solicitudes/solicitud-detalle/solicitud-detalle';
import { SolicitudService } from '../../../core/services/solictud.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-solicitud-dashboard',
  standalone: true,
  imports: [CommonModule, BadgeModule, SolicitudCrear, SolicitudLista, SolicitudDetalle],
  templateUrl: './solicitud-dashboard.component.html',
  styleUrls: ['./solicitud-dashboard.component.css']
})
export class SolicitudDashboard {
  @ViewChild('listaComponent') listaComponent!: SolicitudLista;

  private authService = inject(AuthService);

  mostrarModal = false;
  solicitudSeleccionada: any = null;

  constructor(public solicitudService: SolicitudService) {}

  // Getters de rol
  get esEstudiante(): boolean { return this.authService.getRole() === 'ESTUDIANTE'; }
  get esAdmin(): boolean { return this.authService.getRole() === 'ADMIN'; }
  get esCoordinador(): boolean { return this.authService.getRole() === 'COORDINADOR'; }
  get esDocente(): boolean { return this.authService.getRole() === 'DOCENTE'; }
  get esGestor(): boolean { return this.esAdmin || this.esCoordinador; }

  verDetalleEnModal(solicitud: any) {
    this.solicitudSeleccionada = solicitud;
    this.mostrarModal = true;
  }

  refrescarHistorial() {
    setTimeout(() => this.listaComponent?.cargarDatos(), 300);
  }
}