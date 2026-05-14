import { Component, inject, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solictud.service';
import Swal from 'sweetalert2';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-solicitud-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, Select, Textarea, Button],
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

    const tiposDisponibles = this.tipos.map(t => t.value).join(', ');
    
    // RECUERDA: Cambia esta KEY por una nueva en AI Studio ya que la anterior se expuso
    const apiKey = 'AIzaSyD2rsqVbpCjS0zJcGf0HzHBM19MImkd8GA'; 
    const modelName = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente universitario experto. Analiza el siguiente texto y clasifícalo en uno de estos tipos de trámite: [${tiposDisponibles}]. 
                  Responde ÚNICAMENTE el nombre técnico del trámite (el valor exacto proporcionado).
                  Texto del estudiante: "${descripcion}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Baja temperatura para mayor precisión
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          this.sugerencia = '⏳ Servicio ocupado, intenta en unos segundos.';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Limpieza profunda de la respuesta (quitamos posibles asteriscos o espacios extras)
      const tipoSugerido = (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      ).trim().replace(/[*]/g, '');

      console.log('IA respondió:', tipoSugerido);

      const tipoEncontrado = this.tipos.find(t =>
        tipoSugerido === t.value ||
        tipoSugerido.includes(t.value)
      );

      if (tipoEncontrado) {
        this.solicitudForm.patchValue({
          tipoSolicitud: tipoEncontrado.value
        });
        this.sugerencia = `✓ Sugerido: ${tipoEncontrado.label}`;
      } else {
        this.sugerencia = 'IA sugirió: ' + tipoSugerido + '. Selecciónalo manualmente.';
      }

    } catch (error) {
      console.error('Error IA:', error);
      this.sugerencia = 'Error al consultar la IA. Selecciona el tipo manualmente.';
    } finally {
      this.analizando = false;
      this.cdr.detectChanges();
    }
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
