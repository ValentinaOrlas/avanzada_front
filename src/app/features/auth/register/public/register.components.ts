import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; // Importamos SweetAlert

@Component({
  selector: 'app-registro',
  standalone: true, 
  imports: [ReactiveFormsModule, RouterModule], 
  templateUrl: './register.component.html', 
  styleUrl: './register.css',
})
export class Registro implements OnInit { 
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  
  public tiposDocumento: string[] = [];

  public registerForm: FormGroup = this.fb.group({
    tipoDocumento: ['', [Validators.required]],
    identificacion: ['', [Validators.required]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    tipoUsuario: ['ESTUDIANTE', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.usuarioService.getTiposDocumento().subscribe({
      next: (tipos) => this.tiposDocumento = tipos,
      error: (err) => console.error('Error cargando tipos:', err)
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      // Alerta de "Cargando..."
      Swal.fire({
        title: 'Procesando...',
        text: 'Estamos creando tu cuenta',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      this.usuarioService.registrar(this.registerForm.value).subscribe({
        next: (res) => {
          Swal.fire({
            title: '¡Registro Exitoso!',
            text: `Hola ${this.registerForm.value.nombre}, ya puedes iniciar sesión.`,
            icon: 'success',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Ir al Login'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            }
          });
        },
       error: (err) => {
    // Si el backend responde 409 (Conflicto)
    if (err.status === 409) {
      const mensajeError = err.error?.message || 'Los datos ingresados ya existen.';
      Swal.fire({
        icon: 'warning',
        title: 'Usuario ya existe',
        text: mensajeError,
        confirmButtonColor: '#0056b3'
      });
    } else {
      // Otros errores (500, 400, etc)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un problema inesperado. Inténtalo más tarde.',
        confirmButtonColor: '#d33'
      });
    }
  }
      });
    }
  }
}