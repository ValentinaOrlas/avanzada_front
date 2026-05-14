import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitudService } from '../../../core/services/solictud.service';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavbarComponent {
  // Inyectamos los servicios necesarios
  public authService = inject(AuthService);
  public solicitudService = inject(SolicitudService);
  private router = inject(Router);

  /**
   * Getters para simplificar el HTML.
   * Al usar los métodos del servicio, el HTML se actualizará 
   * automáticamente cuando el estado del AuthService cambie.
   */
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userRole(): string | null {
    return this.authService.getRole(); // Retorna ADMIN, ESTUDIANTE, etc.
  }

  get userName(): string {
    return this.authService.getNombre() || 'Usuario';
  }

  /**
   * Método para cerrar sesión y limpiar el estado
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}