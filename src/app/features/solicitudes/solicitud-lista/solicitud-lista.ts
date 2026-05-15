import { Component, inject, OnInit, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solictud.service';
import { AuthService } from '../../../core/services/auth.service'; // <--- Importante
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-solicitud-lista',
  standalone: true,
  imports: [CommonModule, TableModule, Tag, Button, Card],
  templateUrl: './solicitud-lista.html'
})
export class SolicitudLista implements OnInit {
  private solicitudService = inject(SolicitudService);
  private authService = inject(AuthService); // <--- Inyectamos tu AuthService
  private cdr = inject(ChangeDetectorRef);

  public solicitudes: any[] = [];
  
  @Input() modoAdmin: boolean = false;
  @Output() onVerDetalle = new EventEmitter<any>();

  ngOnInit() {
    this.cargarDatos();
  }

  // solicitud-lista.component.ts

public cargarDatos() {
  // Usamos el servicio de auth para obtener el rol real
  const rol = this.authService.getRole(); 
  console.log('Cargando datos. Rol:', rol, 'Modo Admin:', this.modoAdmin);

  let peticion;

  if (this.modoAdmin) {
    // Si el componente está en la vista de ADMIN, muestra todo
    peticion = this.solicitudService.listarTodas();
  } else if (rol === 'DOCENTE') {
    // SI ES DOCENTE: Solo traemos las que tiene ASIGNADAS
    // Este es el método que evita que vea las solicitudes de otros
    console.log('Filtrando solicitudes asignadas para el docente');
    peticion = this.solicitudService.listarAsignadas();
  } else {
    // SI ES ESTUDIANTE: Solo traemos las que él CREÓ
    peticion = this.solicitudService.listarMisSolicitudes();
  }

  peticion.subscribe({
    next: (res: any) => {
      this.solicitudes = res;
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Error al cargar solicitudes', err)
  });
}

  getSeverity(estado: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined {
    const severities: Record<string, "success" | "secondary" | "info" | "warn" | "danger" | "contrast"> = {
      'REGISTRADA': 'info',
      'CLASIFICADA': 'warn',
      'EN_ATENCION': 'warn',
      'ATENDIDA': 'success',
      'CERRADA': 'secondary',
      'CANCELADA': 'danger'
    };
    return severities[estado] || 'contrast';
  }

  verDetalle(s: any) {
    this.onVerDetalle.emit(s);
  }
}