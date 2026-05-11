import { Component, inject, OnInit } from '@angular/core';
import { SolicitudService } from '../../../core/services/solictud.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-solicitud-lista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solicitud-lista.html',
  styleUrls: ['./solicitud-lista.css']
})
export class SolicitudLista implements OnInit {
  private solicitudService = inject(SolicitudService);
  public solicitudes: any[] = [];
  public cargando = true;

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.solicitudService.listarMisSolicitudes().subscribe({
      next: (res) => {
        this.solicitudes = res.content; 
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }
}