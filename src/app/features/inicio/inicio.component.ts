import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class Inicio {
  pilares = signal([
    {
      titulo: 'Nuestra Misión',
      descripcion: 'Proveer una plataforma ágil y transparente para la gestión de solicitudes académicas, asegurando respuestas oportunas que fortalezcan el proceso formativo institucional.',
      icono: 'pi-flag-fill',
      color: 'blue'
    },
    {
      titulo: 'Nuestra Visión',
      descripcion: 'Ser para el 2028 el canal líder de comunicación digital universitaria, reconocido por su innovación tecnológica y calidez humana en la atención al estudiante.',
      icono: 'pi-compass',
      color: 'amber'
    }
  ]);
}