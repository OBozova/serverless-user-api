export interface User {
  id: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  isAdmin?: boolean;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

export interface StatsResponse {
  userCount: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
}

export interface CustomAuthorizerContext {
  userId: string;
  email?: string;
  name?: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}

export interface ErrorResponse {
  error: string;
}