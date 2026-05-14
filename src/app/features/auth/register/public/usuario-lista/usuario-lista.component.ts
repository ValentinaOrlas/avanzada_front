import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import Swal from 'sweetalert2';

import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, TableModule, Tag, Button, Card],
  templateUrl: './usuario-lista.html'
})
export class UsuarioLista implements OnInit {
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  public usuarios: any[] = [];
  public cargando = true;

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.listarTodos().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
      }
    });
  }

  desactivar(usuario: any) {
    Swal.fire({
      title: `¿Desactivar a ${usuario.nombre}?`,
      text: 'El usuario no podrá iniciar sesión.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.desactivar('CEDULA_CIUDADANIA', usuario.identificacion).subscribe({
          next: () => {
            Swal.fire('Desactivado', 'El usuario fue desactivado.', 'success');
            this.cargarUsuarios();
          },
          error: (err) => Swal.fire('Error', err.error?.mensaje || 'No se pudo desactivar', 'error')
        });
      }
    });
  }

  getRolSeverity(rol: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined {
    switch (rol) {
      case 'ADMIN':        return 'danger';
      case 'COORDINADOR':  return 'warn';
      case 'DOCENTE':      return 'info';
      case 'ESTUDIANTE':   return 'success';
      default:             return 'secondary';
    }
  }

  irACrearPersonal() {
    this.router.navigate(['/admin/crear-personal']);
  }
}