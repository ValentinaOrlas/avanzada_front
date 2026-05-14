import { Routes } from '@angular/router';
import { Inicio } from './features/inicio/inicio.component';
import { Login } from './features/auth/login/login';
import { SolicitudDashboard } from './features/solicitudes/solicitud-dashboard/solicitud-dashboard.component';
import { UsuarioLista } from './features/auth/register/public/usuario-lista/usuario-lista.component';
import { Registro as UsuarioCrear } from './features/auth/register/public/crear-usuario/register.components';
import { rolesGuard } from './core/guards/rotes';
import { CrearPersonalComponent } from './features/auth/register/private/crear-personal.component';

export const routes: Routes = [
  // PÚBLICAS
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: UsuarioCrear },

  // DASHBOARD — todos los roles autenticados
  {
    path: 'solicitudes',
    component: SolicitudDashboard,
    canActivate: [rolesGuard],
    data: { roles: ['ESTUDIANTE', 'ADMIN', 'COORDINADOR', 'DOCENTE'] }
  },

  // LISTA DE USUARIOS — ADMIN y COORDINADOR
  {
    path: 'usuarios',
    component: UsuarioLista,
    canActivate: [rolesGuard],
    data: { roles: ['ADMIN', 'COORDINADOR'] }
  },

  // CREAR PERSONAL — solo ADMIN
  {
    path: 'admin/crear-personal',
    component: CrearPersonalComponent,
    canActivate: [rolesGuard],
    data: { roles: ['ADMIN'] }
  },

  // DEFAULT
  { path: '**', redirectTo: '' }
];