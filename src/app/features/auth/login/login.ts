import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  public tiposDocumento: string[] = [];
  public loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      tipoDocumento: ['', [Validators.required]],
      identificacion: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposDocumento();
  }

  cargarTiposDocumento() {
    this.usuarioService.getTiposDocumento().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
        console.log('Documentos cargados en Login:', tipos);
      },
      error: (err) => {
        console.error('Error cargando tipos en Login:', err);
        // Opcional: Reintentar después de 2 segundos si falla
        // setTimeout(() => this.cargarTiposDocumento(), 2000);
      }
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Intentando login con:', this.loginForm.value);
      // Aquí llamarías a tu servicio de autenticación
      // this.usuarioService.login(this.loginForm.value).subscribe(...)
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}