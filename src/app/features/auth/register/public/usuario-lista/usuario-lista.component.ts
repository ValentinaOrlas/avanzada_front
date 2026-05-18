import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../../../core/services/usuario.service';
import { AuthService } from '../../../../../core/services/auth.service';
import Swal from 'sweetalert2';

import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, TableModule, Tag, Button, Card, TooltipModule],
  templateUrl: './usuario-lista.html',
  styleUrl: './usuario-lista.css'
})
export class UsuarioLista implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  public usuarios: any[] = [];
  public cargando = true;

  get esAdmin(): boolean { return this.authService.getRole() === 'ADMIN'; }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.listarTodos().subscribe({
      next: (res) => {
        this.usuarios = res;
        Promise.resolve().then(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        Promise.resolve().then(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        });
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

  get totalActivos(): number   { return this.usuarios.filter(u => u.activo).length; }
  get totalInactivos(): number { return this.usuarios.filter(u => !u.activo).length; }

  getInitials(nombre: string): string {
    if (!nombre) return '?';
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? partes[0][0] + partes[1][0]
      : partes[0].substring(0, 2);
  }

  getAvatarColor(rol: string): string {
    const colores: Record<string, string> = {
      ADMIN:       '#dc2626',
      COORDINADOR: '#d97706',
      DOCENTE:     '#2563eb',
      ESTUDIANTE:  '#16a34a'
    };
    return colores[rol] ?? '#6b7280';
  }

  formatRol(rol: string): string {
    const labels: Record<string, string> = {
      ADMIN:       'Admin',
      COORDINADOR: 'Coordinador',
      DOCENTE:     'Docente',
      ESTUDIANTE:  'Estudiante'
    };
    return labels[rol] ?? rol;
  }
}