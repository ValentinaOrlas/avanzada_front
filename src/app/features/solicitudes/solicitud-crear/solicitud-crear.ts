import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // Importamos ChangeDetectorRef
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SolicitudService } from '../../../core/services/solictud.service';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select'; 
import { Textarea } from 'primeng/textarea'; 
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-solicitud-crear',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, Card, Select, Textarea, TableModule, Button, Tag
  ],
  templateUrl: './solicitud-crear.html',
  styleUrls: ['./solicitud-crear.css']
})
export class SolicitudCrear implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudService = inject(SolicitudService);
  private cdr = inject(ChangeDetectorRef); // <-- Inyectamos esto para solucionar NG0100

  public tipos: any[] = [];
  public solicitudes: any[] = [];

  public solicitudForm = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(20)]],
    tipo: ['', [Validators.required]],
    prioridad: ['MEDIA'],
    canal: ['SAC'] // Asegúrate de que el Backend espere exactamente este string
  });

  ngOnInit(): void {
    this.cargarTipos();
    this.obtenerHistorial();
  }

  cargarTipos(): void {
    this.solicitudService.getTipos().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.content || []);
        this.tipos = data.map((t: string) => ({ 
          label: t.replace(/_/g, ' '), 
          value: t 
        }));
        
        this.cdr.detectChanges(); // <-- SOLUCIÓN NG0100: Avisamos a Angular que los datos llegaron
      },
      error: (err) => console.error('Error al cargar tipos:', err)
    });
  }

  obtenerHistorial(): void {
    this.solicitudService.listarMisSolicitudes().subscribe({
      next: (res: any) => {
        this.solicitudes = Array.isArray(res) ? res : (res?.content || []);
        this.cdr.detectChanges(); // <-- Recomendado también aquí
      }
    });
  }

  onSubmit(): void {
    if (this.solicitudForm.valid) {
      // Usamos getRawValue() para asegurar que incluya los campos que no se tocan (prioridad y canal)
      const payload = this.solicitudForm.getRawValue();
      
      console.log('Enviando al backend:', payload); // Mira esto en la consola antes de que falle

      this.solicitudService.crearSolicitud(payload).subscribe({
        next: () => {
          this.solicitudForm.controls.descripcion.reset();
          this.solicitudForm.controls.tipo.reset();
          this.solicitudForm.patchValue({ prioridad: 'MEDIA', canal: 'SAC' });
          this.obtenerHistorial();
        },
        error: (err) => {
          console.error('Error al crear solicitud:', err);
          // Si sigue saliendo el error 400, revisa si el campo se llama 'canal' o 'canalOrigen' en tu Backend
        }
      });
    }
  }
}