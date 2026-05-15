import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { SolicitudService } from '../../../core/services/solictud.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clasificar-solicitud',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DialogModule, 
    ButtonModule, 
    SelectModule, 
    TextareaModule
  ],
  templateUrl: './clasificar-solicitud.html'
})
export class ClasificarSolicitud implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);

  @Input() display: boolean = false;
  @Input() solicitud: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUpdate = new EventEmitter<void>();

  public enviando = false;
  public tipos: any[] = [];
  public prioridades = [
    { label: 'Alta',  value: 'ALTA' },
    { label: 'Media', value: 'MEDIA' },
    { label: 'Baja',  value: 'BAJA' }
  ];

  public form = this.fb.group({
    tipoSolicitud: [null],
    prioridad:     [null],
    justificacion: ['', [
      Validators.required, 
      Validators.minLength(10), 
      Validators.maxLength(500)
    ]]
  });

  ngOnInit() {
    this.cargarTipos();
  }

  cargarTipos() {
    this.solicitudService.getTipos().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.tipos = data.map((t: string) => ({ 
          label: t.replace(/_/g, ' '), 
          value: t 
        }));
      },
      error: () => console.error('Error al cargar tipos de trámite')
    });
  }

  cerrar() {
    this.form.reset();
    this.onClose.emit();
  }

  onSubmit() {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const payload = this.form.getRawValue();

    this.solicitudService.clasificarSolicitud(this.solicitud.codigo, payload).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Clasificada!',
          text: 'La solicitud fue clasificada exitosamente.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        this.form.reset();
        this.onUpdate.emit();
        this.onClose.emit();
        this.enviando = false;
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', err.error?.mensaje || 'No se pudo completar la acción', 'error');
      }
    });
  }
}