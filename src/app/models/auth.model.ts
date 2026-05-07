// Espejo exacto de tu LoginRequest en Java
export interface LoginRequest {
  tipoDocumento: string;  
  identificacion: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}