import { Routes } from '@angular/router';
import { Inicio } from './features/inicio/inicio';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/register/public/register.components';
import { SolicitudLista } from './features/solicitudes/solicitud-lista/solicitud-lista';
import { SolicitudCrear } from './features/solicitudes/solicitud-crear/solicitud-crear';
import { SolicitudDetalle } from './features/solicitudes/solicitud-detalle/solicitud-detalle';
import { UsuarioLista } from './componentes/usuario-lista/usuario-lista';
import { UsuarioDetalle } from './componentes/usuario-detalle/usuario-detalle';
import { UsuarioCrear } from './componentes/usuario-crear/usuario-crear';
import { rolesGuard } from './core/guards/rotes'; 
import { CrearPersonalComponent } from './features/auth/register/private/crear-personal.component';

export const routes: Routes = [
  // RUTAS PÚBLICAS
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  // SOLICITUDES (Protegidas por Login mínimo)
  {
    path: 'solicitudes',
    canActivate: [rolesGuard],
    // Todos los roles pueden entrar a la lista, pero verán cosas distintas
    data: { roles: ['ESTUDIANTE', 'DOCENTE', 'COORDINADOR', 'ADMIN'] },
    children: [
      { path: '', component: SolicitudLista },
      { 
        path: 'nueva', 
        component: SolicitudCrear, 
        data: { roles: ['ESTUDIANTE', 'ADMIN'] } // El Docente/Coord no suele crear
      },
      { path: ':id', component: SolicitudDetalle }
    ]
  },

  {
    path: 'usuarios',
    canActivate: [rolesGuard],
    data: { roles: ['ADMIN', 'COORDINADOR'] }, 
    children: [
      { path: '', component: UsuarioLista },
      { path: 'nuevo', component: UsuarioCrear, data: { roles: ['ADMIN'] } }
    ]
  },

  // ADMIN: Crear Personal (Docentes/Coordinadores)
  { 
    path: 'admin/crear-personal', 
    component: CrearPersonalComponent,
    canActivate: [rolesGuard],
    data: { roles: ['ADMIN'] } 
  },


  // REDIRECCIONES
  { path: '**', redirectTo: '' }
];