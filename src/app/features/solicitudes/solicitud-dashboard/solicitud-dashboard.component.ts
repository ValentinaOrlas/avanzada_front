import { Component, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  mostrarModal = false;
  solicitudSeleccionada: any = null;
  
  // Propiedad para enviar la trazabilidad procesada al componente hijo <app-solicitud-detalle>
  historialSeleccionado: any[] = [];

  constructor(public solicitudService: SolicitudService) {}

  // Getters de rol
  get esEstudiante(): boolean { return this.authService.getRole() === 'ESTUDIANTE'; }
  get esAdmin(): boolean { return this.authService.getRole() === 'ADMIN'; }
  get esCoordinador(): boolean { return this.authService.getRole() === 'COORDINADOR'; }
  get esDocente(): boolean { return this.authService.getRole() === 'DOCENTE'; }
  get esGestor(): boolean { return this.esAdmin || this.esCoordinador; }

  /**
   * Abre el modal y consulta la trazabilidad completa en el backend
   */
  verDetalleEnModal(solicitud: any) {
    this.solicitudSeleccionada = solicitud;
    this.historialSeleccionado = []; // Limpiar historial previo para evitar flasheos visuales
    this.mostrarModal = true;

    console.log('Datos de la fila seleccionada:', solicitud);

    // CORRECCIÓN CRÍTICA: Se cambia 'solicitud.id' por 'solicitud.codigo' ya que allí reside el UUID (evita error 422)
    const identificadorReal = solicitud.codigo;

    if (!identificadorReal) {
      console.error('No se detectó un identificador/código válido en la solicitud mapeada.');
      this.inyectarHitoInicial(solicitud);
      return;
    }

    // Llamada al endpoint /api/solicitudes/{codigo}/historial
    this.solicitudService.obtenerHistorial(identificadorReal).subscribe({
      next: (eventos: any[]) => {
        if (eventos && eventos.length > 0) {
          // Mapeamos los campos exactos del record EventoHistorialResponse
          this.historialSeleccionado = eventos.map(evento => ({
            secuencia: evento.secuencia,
            fecha: evento.fechaHora,
            // Transforma "SOLICITUD_REGISTRADA" en "solicitud registrada" para el pipe 'titlecase' en HTML
            accionTexto: evento.accion ? evento.accion.replace(/_/g, ' ').toLowerCase() : 'acción desconocida',
            usuario: evento.usuarioNombre || 'Sistema',
            observacion: evento.observacion,
            estadoNuevo: evento.estadoNuevo,
            icono: this.obtenerIconoHito(evento.accion),
            color: this.obtenerColorHito(evento.accion)
          }));
        } else {
          // FALLBACK DEFENSIVO: Si la lista de la base de datos viene vacía (Caso nuevo), forzamos el hito inicial
          this.inyectarHitoInicial(solicitud);
        }
        this.cdr.detectChanges(); // Asegura la correcta detección de cambios asíncronos en PrimeNG
      },
      error: (err) => {
        console.error('Error al recuperar la trazabilidad de la solicitud:', err);
        // FALLBACK POR ERROR: Si el servicio web cae, dibujamos el hito de protección para que no se quede cargando infinitamente
        this.inyectarHitoInicial(solicitud);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Inyecta de forma manual y controlada el hito número uno en la línea de tiempo si el backend no reporta eventos
   */
  private inyectarHitoInicial(solicitud: any) {
    this.historialSeleccionado = [{
      secuencia: 1,
      fecha: solicitud.fechaCreacion || new Date(),
      accionTexto: 'solicitud registrada',
      usuario: solicitud.solicitanteNombre || 'Usuario de la Plataforma',
      observacion: 'La solicitud ha ingresado al sistema correctamente.',
      icono: 'pi pi-plus-circle',
      color: '#3b82f6'
    }];
  }

  /**
   * Asigna un icono de PrimeIcons específico según el TipoAccion del backend
   */
  private obtenerIconoHito(accion: string): string {
    switch (accion) {
      case 'SOLICITUD_REGISTRADA': return 'pi pi-plus-circle';
      case 'CLASIFICADA': return 'pi pi-tags';
      case 'RESPONSABLE_ASIGNADO': return 'pi pi-user-plus';
      case 'ATENCION_INICIADA': return 'pi pi-play';
      case 'SOLICITUD_ATENDIDA': return 'pi pi-check-circle';
      case 'SOLICITUD_CANCELADA': return 'pi pi-ban';
      case 'SOLICITUD_CERRADA': return 'pi pi-lock';
      case 'PRIORIDAD_MODIFICADA': return 'pi pi-exclamation-circle';
      case 'ESTADO_MODIFICADO': return 'pi pi-refresh';
      default: return 'pi pi-info-circle';
    }
  }

  /**
   * Asigna un color hexadecimal para el marcador del p-timeline según el flujo
   */
  private obtenerColorHito(accion: string): string {
    if (!accion) return '#6c757d'; // Gris por defecto
    
    if (accion.includes('REGISTRADA')) return '#3b82f6'; // Azul corporativo
    if (accion.includes('ATENDIDA') || accion.includes('CERRADA')) return '#22c55e'; // Verde de éxito
    if (accion.includes('CANCELADA')) return '#ef4444'; // Rojo de error/alerta
    
    return '#f59e0b'; // Naranja para los estados intermedios (Clasificación, Asignación, etc)
  }

  /**
   * 🔥 REFACTORIZADO: Nombre semántico ideal para escuchar la acción (Event Binding) 
   * desde la directiva (solicitudCreada)="refrescarListaSolicitudes()"
   */
  refrescarListaSolicitudes() {
    setTimeout(() => {
      if (this.listaComponent) {
        this.listaComponent.cargarDatos();
      }
    }, 300);
  }
}