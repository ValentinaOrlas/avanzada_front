import { Routes } from '@angular/router';
import { SolicitudLista } from './features/solicitudes/solicitud-lista/solicitud-lista';
import { SolicitudCrear } from './features/solicitudes/solicitud-crear/solicitud-crear';
import { SolicitudDetalle } from './features/solicitudes/solicitud-detalle/solicitud-detalle';
import { UsuarioLista } from './features/usuario/usuario-lista/usuario-lista';
import { UsuarioDetalle } from './features/usuario/usuario-detalle/usuario-detalle';
import { Inicio } from './features/inicio/inicio';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/registro/registro';
import { CrearPersonalComponent } from './features/auth/register/private/crear-personal.component';
import { rolesGuard } from './core/guards/rotes';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  {
    path: 'solicitudes',
    children: [
      { path: '', component: SolicitudLista },
      { path: 'nueva', component: SolicitudCrear },
      { path: ':id', component: SolicitudDetalle },
    ]
  },
  { 
    path: 'admin/crear-personal', 
    component: CrearPersonalComponent,
    canActivate: [rolesGuard],
    data: { roles: ['ADMIN'] } 
  },
  {
    path: 'usuarios',
    children: [
      { path: '', component: UsuarioLista },       // Listado: /usuarios
      { path: ':id', component: UsuarioDetalle }    // Ver uno solo: /usuarios/1094...
    ]
  },
  {
    path: '',
    redirectTo: 'solicitudes',
    pathMatch: 'full'
  },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];

