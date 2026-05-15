import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Textarea } from 'primeng/textarea'; // Importar este módulo específico
import { SolicitudService } from '../../../core/services/solictud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-atender-solicitud',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DialogModule, 
    ButtonModule, 
    Textarea // Asegúrate de agregarlo aquí
  ],
  templateUrl: './atender-solicitud.html',
  styles: [`
    :host ::ng-deep .custom-atender-dialog .p-dialog-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 1.25rem;
    }
    :host ::ng-deep .custom-atender-dialog .p-dialog-content {
      padding: 1.5rem;
    }
    textarea:focus {
      border-color: var(--primary-color) !important;
      box-shadow: 0 0 0 0.2rem var(--primary-100) !important;
    }
  `]
})
export class AtenderSolicitud {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  public enviando = false;

  public form = this.fb.group({
    observacion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
  });

  cerrar() {
    this.form.reset();
    this.onClose.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.enviando) return;

    this.enviando = true;
    const payload = { observacion: this.form.get('observacion')?.value };

    this.solicitudService.atenderSolicitud(this.solicitud.codigo, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Tarea Completada!',
          text: 'La solicitud ha sido marcada como atendida correctamente.',
          confirmButtonColor: '#22c55e'
        });
        this.form.reset();
        this.onUpdate.emit();
        this.onClose.emit();
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', err.error?.mensaje || 'No se pudo procesar la solicitud', 'error');
      }
    });
  }
}