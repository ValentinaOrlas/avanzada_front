import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './features/auth/login/login';
import { Registro } from './features/auth/register/public/register.components';
import { SolicitudLista } from './componentes/solicitud-lista/solicitud-lista';
import { SolicitudCrear } from './componentes/solicitud-crear/solicitud-crear';
import { SolicitudDetalle } from './componentes/solicitud-detalle/solicitud-detalle';
import { UsuarioLista } from './componentes/usuario-lista/usuario-lista';
import { UsuarioDetalle } from './componentes/usuario-detalle/usuario-detalle';
import { UsuarioCrear } from './componentes/usuario-crear/usuario-crear';
import { rolesGuard } from './core/guards/rotes'; 
import { CrearPersonalComponent } from './features/auth/register/private/crear-personal.component'; // Ajusta la ruta según tu carpeta


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
      { path: 'nuevo', component: UsuarioCrear },   // Formulario: /usuarios/nuevo
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

