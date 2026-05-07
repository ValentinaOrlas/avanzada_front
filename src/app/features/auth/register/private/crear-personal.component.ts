import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service'; // Ajusta la ruta
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-personal',
  standalone: true,
  imports: [ReactiveFormsModule],

  templateUrl: './crear-personal.component.html',
  styleUrl: './crear-personal.component.css'
})
export class CrearPersonalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  public tiposDocumento: string[] = [];
  public rolesDisponibles: string[] = ['ADMIN', 'COORDINADOR', 'DOCENTE']; // O traerlos del back

  public personalForm: FormGroup = this.fb.group({
    tipoDocumento: ['', [Validators.required]],
    identificacion: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    tipoUsuario: ['', [Validators.required]], // Aquí elegiremos el cargo
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
 
    this.usuarioService.getTiposDocumento().subscribe(tipos => this.tiposDocumento = tipos);
  }

  onSubmit() {
    if (this.personalForm.valid) {
      // Llamamos al endpoint privado que creaste en Java
      this.usuarioService.registrarPersonal(this.personalForm.value).subscribe({
        next: () => {
          alert('Personal administrativo creado con éxito');
          this.router.navigate(['/usuarios']); 
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }
}