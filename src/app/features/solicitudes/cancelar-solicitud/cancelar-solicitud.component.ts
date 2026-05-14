import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { SolicitudService } from '../../../core/services/solictud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cancelar-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, Button, Textarea],
  templateUrl: './cancelar-solicitud.html'
})
export class CancelarSolicitud {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  public enviando = false;

  public form = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10)]]
  });

  cerrar() {
    this.form.reset();
    this.onClose.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.enviando) return;

    this.enviando = true;
    const payload = { motivo: this.form.get('motivo')?.value };

    this.solicitudService.cancelarSolicitud(this.solicitud.codigo, payload).subscribe({
      next: () => {
        Swal.fire('¡Cancelada!', 'La solicitud fue cancelada exitosamente.', 'success');
        this.form.reset();
        this.onUpdate.emit();
        this.onClose.emit();
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', err.error?.mensaje || 'No se pudo cancelar', 'error');
      }
    });
  }
}