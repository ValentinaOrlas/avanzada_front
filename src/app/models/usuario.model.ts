export interface CrearUsuarioRequest {
  tipoDocumento: string; 
  identificacion: string;
  nombre: string;
  email: string;
  tipoUsuario: string;
  password: string;
}

export interface DetalleUsuarioResponse {
  identificacion: string;
  nombre: string;
  email: string;
  // ... otros campos que devuelva tu mapper
}