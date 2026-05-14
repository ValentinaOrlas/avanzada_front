import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/nav/nav.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true, // Muy importante en Angular 18
  imports: [
    RouterOutlet,
    NavbarComponent, 
    FooterComponent 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] 
})
export class App {

  title = signal('Gestión de Solicitudes Académicas');
  footerText = signal('Universidad del Quindío');
}