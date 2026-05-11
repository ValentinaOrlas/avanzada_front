import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service'; // Asegúrate de importar tu AuthService
import { Router, RouterModule } from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  encapsulation: ViewEncapsulation.None
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  public tiposDocumento: string[] = [];

  public loginForm = this.fb.group({
    tipoDocumento: ['', [Validators.required]],
    identificacion: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Carga los tipos de documento
    this.usuarioService.getTiposDocumento().subscribe({
      next: (res) => this.tiposDocumento = res,
      error: () => console.error("Error cargando documentos")
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Autenticando...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false
      });

      this.authService.login(this.loginForm.value as any).subscribe({
        next: (res) => {
          Swal.close();

          // Notificación de éxito elegante
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });

          Toast.fire({
            icon: 'success',
            title: `¡Bienvenido, ${res.nombre}!`
          });

          // En login.ts tras el éxito:
          this.router.navigate(['/solicitudes']);
        },
        error: (err) => {
          Swal.fire({
            title: 'Error de Acceso',
            text: err.error?.message || 'Identificación o contraseña incorrectas',
            icon: 'error',
            confirmButtonColor: '#0d6efd'
          });
        }
      });
    }
  }
}