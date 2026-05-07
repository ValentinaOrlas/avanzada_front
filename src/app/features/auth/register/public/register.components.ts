import { Component, inject, OnInit } from '@angular/core'; // Importamos OnInit
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true, 
  imports: [ReactiveFormsModule], 
  templateUrl: './register.html', 
  styleUrl: './register.css',
})
export class Registro implements OnInit { 
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  
  public tiposDocumento: string[] = [];

  public registerForm: FormGroup = this.fb.group({
    tipoDocumento: ['', [Validators.required]], // Empezamos vacío
    identificacion: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    tipoUsuario: ['ESTUDIANTE', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Este método se ejecuta AUTOMÁTICAMENTE al cargar el componente
  ngOnInit(): void {
    this.usuarioService.getTiposDocumento().subscribe({
      next: (tipos) => {
        this.tiposDocumento = tipos;
        console.log('Documentos cargados:', tipos);
      },
      error: (err) => console.error('Error cargando tipos:', err)
    });
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.usuarioService.registrar(this.registerForm.value).subscribe({
        next: (res) => {
          alert('Usuario creado con éxito');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          alert('Error al registrar usuario');
        }
      });
    }
  }
}