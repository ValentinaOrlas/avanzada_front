import { Component, inject, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solictud.service';
import Swal from 'sweetalert2';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-solicitud-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select, Textarea, Button, TableModule],
  templateUrl: './solicitud-crear.html'
})
export class SolicitudCrear implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);
  private cdr = inject(ChangeDetectorRef);

  @Output() solicitudCreada = new EventEmitter<void>();

  public tipos: any[] = [];
  public enviando = false;
  public analizando = false;
  public sugerencia: string = '';
  public solicitudes: any[] = [];

  public solicitudForm = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(20)]],
    tipoSolicitud: [null, [Validators.required]],
    prioridad: ['MEDIA'],
    canalOrigen: ['SAC']
  });

  ngOnInit(): void {
    this.solicitudService.getTipos().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.content || []);
        this.tipos = data.map((t: string) => ({
          label: t.replace(/_/g, ' '),
          value: t
        }));
        this.cdr.detectChanges();
      }
    });
  }

  async sugerirTramite(): Promise<void> {
    const descripcion = this.solicitudForm.get('descripcion')?.value ?? '';
    if (!descripcion || descripcion.length < 20) return;

    this.analizando = true;
    this.sugerencia = '';

    // Enviamos solo los valores técnicos al backend
    const tiposDisponibles = this.tipos.map(t => t.value);

    this.solicitudService.obtenerSugerenciaIA(descripcion, tiposDisponibles).subscribe({
  next: (res) => {
    // Usamos setTimeout para que el cambio ocurra en el siguiente ciclo de detección
    setTimeout(() => {
      const tipoSugerido = res.sugerencia.replace(/[*]/g, '').trim();
      const tipoEncontrado = this.tipos.find(t => tipoSugerido.includes(t.value));

      if (tipoEncontrado) {
        this.solicitudForm.patchValue({ tipoSolicitud: tipoEncontrado.value });
        this.sugerencia = `✓ Sugerido: ${tipoEncontrado.label}`;
      } else {
        this.sugerencia = 'La IA no pudo determinar el tipo exacto.';
      }
      
      this.analizando = false;
      this.cdr.detectChanges(); // Le decimos a Angular: "¡Ey, mira de nuevo!"
    }, 0);
  },
  error: () => {
    setTimeout(() => {
      this.sugerencia = 'Error al conectar con la IA.';
      this.analizando = false;
      this.cdr.detectChanges();
    }, 0);
  }
});
  }


  onSubmit(): void {
    if (this.solicitudForm.valid && !this.enviando) {
      this.enviando = true;
      const payload = this.solicitudForm.getRawValue();

      this.solicitudService.crearSolicitud(payload).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Solicitud enviada correctamente', 'success');
          this.solicitudForm.reset({
            descripcion: '',
            tipoSolicitud: null,
            prioridad: 'MEDIA',
            canalOrigen: 'SAC'
          });
          this.sugerencia = '';
          this.enviando = false;
          this.solicitudCreada.emit();
        },
        error: (err) => {
          this.enviando = false;
          Swal.fire('Error', err.error?.mensaje || 'Error al validar', 'error');
        }
      });
    }
  }
}
