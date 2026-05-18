import { Component, inject, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-crear-personal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select, InputTextModule, PasswordModule, Button],
  templateUrl: './crear-personal.component.html',
  styleUrl: './crear-personal.component.css'
})
export class CrearPersonalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
   private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  public tiposDocumento: string[] = [];
  public enviando = false;

  // Opciones de roles con etiquetas legibles
  public rolesOpciones = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Coordinador',   value: 'COORDINADOR' },
    { label: 'Docente',       value: 'DOCENTE' }
  ];

  public personalForm: FormGroup = this.fb.group({
    tipoDocumento:  ['', [Validators.required]],
    identificacion: ['', [Validators.required]],
    nombre:         ['', [Validators.required]],
    email:          ['', [Validators.required, Validators.email]],
    tipoUsuario:    ['', [Validators.required]],
    password:       ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.usuarioService.getTiposDocumento().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
        this.cdr.detectChanges(); // ← aquí
      }
    });
  }

  onSubmit() {
    if (this.personalForm.valid && !this.enviando) {
      this.enviando = true;
      this.usuarioService.registrarPersonal(this.personalForm.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Personal creado!',
            text: 'El usuario administrativo fue registrado exitosamente.',
            confirmButtonColor: '#0a2a5e'
          }).then(() => this.router.navigate(['/usuarios']));
        },
        error: (err) => {
          this.enviando = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.mensaje || 'No se pudo crear el usuario.',
            confirmButtonColor: '#0a2a5e'
          });
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/usuarios']);
  }
}