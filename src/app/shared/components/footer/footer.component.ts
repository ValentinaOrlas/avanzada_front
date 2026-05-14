import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-dark text-white py-4">
      <div class="container text-center">
        <p class="mb-1 fw-bold">Universidad del Quindío - Sistema PQRS</p>
        <p class="small mb-0 opacity-75">© 2026 Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    footer { border-top: 3px solid #0056b3; }
  `]
})
export class FooterComponent {}