import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { SolicitudService } from '../../../core/services/solictud.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignar-responsable',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, Button, Select],
  templateUrl: './asignar-responsable.html'
})
export class AsignarResponsable implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService); // ← faltaba esto

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  public enviando = false;
  public responsables: any[] = [];

  public form = this.fb.group({
    responsableId: [null, [Validators.required]]
  });

  ngOnInit() {
    // Solo carga si tiene permisos
    const rol = this.authService.getRole();
    if (rol === 'ADMIN' || rol === 'COORDINADOR') {
      this.usuarioService.listarTodos().subscribe({
        next: (res) => {
          this.responsables = res
            .filter((u: any) =>
              (u.tipoUsuario === 'DOCENTE' ) && u.activo
            )
            .map((u: any) => ({
              label: `${u.nombre} (${u.tipoUsuario})`,
              value: u.identificacion
            }));
        },
        error: () => console.warn('Sin permisos para cargar responsables')
      });
    }
  }

  cerrar() {
    this.form.reset();
    this.onClose.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.enviando) return;

    this.enviando = true;
    const payload = { responsableId: this.form.get('responsableId')?.value };

    this.solicitudService.asignarResponsable(this.solicitud.codigo, payload).subscribe({
      next: () => {
        Swal.fire('¡Asignado!', 'Responsable asignado exitosamente.', 'success');
        this.form.reset();
        this.onUpdate.emit();
        this.onClose.emit();
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', err.error?.mensaje || 'No se pudo asignar', 'error');
      }
    });
  }
}