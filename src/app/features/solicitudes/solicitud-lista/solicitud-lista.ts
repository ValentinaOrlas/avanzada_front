import { Component, inject, OnInit, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solictud.service';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-solicitud-lista',
  standalone: true,
  imports: [CommonModule, TableModule, Tag, Button, Card],
  templateUrl: './solicitud-lista.html'
})
export class SolicitudLista implements OnInit {
  private solicitudService = inject(SolicitudService);
  private cdr = inject(ChangeDetectorRef);

  public solicitudes: any[] = [];
  @Input() modoAdmin: boolean = false;
  @Output() onVerDetalle = new EventEmitter<any>();

  ngOnInit() {
    this.cargarDatos();

  }
  getSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined {
    switch (estado) {
      case 'REGISTRADA': return 'info';
      case 'CLASIFICADA': return 'warn';
      case 'EN_ATENCION': return 'warn';
      case 'ATENDIDA': return 'success';
      case 'CERRADA': return 'secondary';
      case 'CANCELADA': return 'danger';
      default: return 'contrast';
    }
  }

  public cargarDatos() {
    console.log('modoAdmin:', this.modoAdmin);

    const peticion = this.modoAdmin
      ? this.solicitudService.listarTodas()
      : this.solicitudService.listarMisSolicitudes();

    peticion.subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);
        this.solicitudes = Array.isArray(res) ? res : (res?.contenido || []);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar solicitudes', err)
    });
  }

  verDetalle(s: any) {
    this.onVerDetalle.emit(s);
  }
}
