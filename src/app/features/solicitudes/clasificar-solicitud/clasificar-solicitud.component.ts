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
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, SelectModule, TextareaModule],
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
  public sugiriendo = false;        // ← loading del botón IA
  public sugerenciaAplicada = false; // ← para mostrar el badge "Sugerido por IA"

  public tipos: any[] = [];
  public prioridades = [
    { label: 'Crítica', value: 'CRITICA' },
    { label: 'Alta',    value: 'ALTA' },
    { label: 'Media',   value: 'MEDIA' },
    { label: 'Baja',    value: 'BAJA' }
  ];

  public form = this.fb.group({
    tipoSolicitud: [null],
    prioridad:     ['MEDIA' as string | null],
    justificacion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
  });

  ngOnInit() {
    this.cargarTipos();
  }

  cargarTipos() {
    this.solicitudService.getTipos().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.tipos = data.map((t: string) => ({ label: t.replace(/_/g, ' '), value: t }));
      },
      error: () => console.error('Error al cargar tipos')
    });
  }

  sugerirConIA() {
    const descripcion = this.solicitud?.descripcion || this.solicitud?.descripcionBreve;

    if (!descripcion) {
      Swal.fire('Atención', 'La solicitud no tiene descripción para analizar.', 'warning');
      return;
    }

    this.sugiriendo = true;
    this.sugerenciaAplicada = false;

    const tiposDisponibles = this.tipos.map(t => t.value);

    this.solicitudService.sugerirClasificacion(descripcion, tiposDisponibles).subscribe({
      next: (res) => {
        const tipoSugerido    = this.tipos.find(t => t.value === res.tipo)?.value ?? null;
        const prioridadSugerida = this.prioridades.find(p => p.value === res.prioridad)?.value ?? 'MEDIA';

        this.form.patchValue({
          tipoSolicitud: tipoSugerido,
          prioridad: prioridadSugerida
        });

        this.sugerenciaAplicada = true;
        this.sugiriendo = false;

        Swal.fire({
          title: '✨ IA clasificó la solicitud',
          html: `
            <div style="text-align:left; font-size: 0.95rem;">
              <p><b>Tipo sugerido:</b> ${res.tipo?.replace(/_/g, ' ') ?? 'No determinado'}</p>
              <p><b>Prioridad sugerida:</b> ${res.prioridad ?? 'MEDIA'}</p>
              <p style="color:#6c757d; font-size:0.85rem; margin-top:8px;">
                Puedes ajustar los valores antes de confirmar.
              </p>
            </div>`,
          icon: 'info',
          confirmButtonColor: '#6366f1'
        });
      },
      error: () => {
        this.sugiriendo = false;
        Swal.fire('Error', 'No se pudo obtener la sugerencia de IA.', 'error');
      }
    });
  }

  cerrar() {
    this.form.reset();
    this.sugerenciaAplicada = false;
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
        Swal.fire({ title: '¡Clasificada!', text: 'Solicitud clasificada exitosamente.', icon: 'success', confirmButtonColor: '#10b981' });
        this.form.reset();
        this.sugerenciaAplicada = false;
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