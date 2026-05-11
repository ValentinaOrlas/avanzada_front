import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Getter corregido: Verifica si el token existe
  get isLoggedIn(): boolean { 
    return !!this.authService.getToken(); 
  }

  get role() { return localStorage.getItem('rol'); }
  get nombre() { return localStorage.getItem('nombre'); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}