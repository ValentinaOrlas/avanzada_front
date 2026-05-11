import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';
import { DetalleUsuarioResponse } from '../../../models/usuario.model';


@Component({
  selector: 'app-usuario-detalle',
  imports: [CommonModule],
  templateUrl: './usuario-detalle.html',
  styleUrl: './usuario-detalle.css',
})
export class UsuarioDetalle implements OnInit {
  private usuarioService = inject(UsuarioService);
  
  public usuario?: DetalleUsuarioResponse;
  public cargando: boolean = true;
  public error: boolean = false;

  ngOnInit(): void {
    // Al cargar, el interceptor de Angular debería adjuntar el Token automáticamente
    this.usuarioService.obtenerDetallePropio().subscribe({
      next: (data) => {
        this.usuario = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener datos del token:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }
}