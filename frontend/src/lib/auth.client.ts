import { api } from './api';
import * as storage from './auth-storage';
import { User } from '@/types/user';

// ============================================================================
// Types & Interfaces
// ============================================================================

// Login credentials - Dữ liệu login
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  role: 'CUSTOMER' | 'STAFF' | 'DRIVER' | 'ADMIN';
}

// Login response from backend POST /auth/login
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'STAFF' | 'DRIVER' | 'ADMIN';
  };
}

// Register response from backend POST /auth/register
interface RegisterResponse {
  userId: string;
}

// Auth state that components can use - State xác thực cho React 
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// ============================================================================
// Core Authentication Methods
// ============================================================================

// Login user with email and password
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    storage.setToken(response.access_token);
    
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
    };
    storage.setUser(user);
    
    return user;
  } catch (error) {
    storage.clearAuth();
    throw error;
  }
}

// Register a new user
export async function register(data: RegisterData): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', data);
}

// Logout current user
export function logout(): void {
  storage.clearAuth();
}

// ============================================================================
// Session Management
// ============================================================================

// Get current authenticated user from localStorage (no backend validation)
export function getCurrentUser(): User | null {
  return storage.getUser();  // Lấy thông tin người dùng từ localStorage
}

// Check if user is currently authenticated (token exists in localStorage)
export function isAuthenticated(): boolean {
  return storage.isAuthenticated();
}

// Fetch current user profile from backend (validates token)
export async function fetchCurrentUser(): Promise<User> {
  try {
    const user = await api.get<User>('/auth/me');
    storage.setUser(user);   // lưu thông tin user lại (nếu valid)
    return user;
  } catch (error) {
    storage.clearAuth();  // nếu có lỗi thì xóa thông tin đăng nhập
    throw error;      // quăng lỗi lên UI
  }
}

// Get current auth state (user + isAuthenticated)qq
export function getAuthState(): AuthState {
  return {
    user: getCurrentUser(),
    isAuthenticated: isAuthenticated(),
  };
}

// ============================================================================
// Utility & Helper Functions
// ============================================================================

// Check if current user has a specific role - kiểm tra role
export function hasRole(role: User['role']): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

// Check if current user has any of the specified roles
export function hasAnyRole(roles: User['role'][]): boolean {
  const user = getCurrentUser();
  return user ? roles.includes(user.role) : false;
}

// Require authentication - throw error if not authenticated
export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
}

// Require specific role - throw error if user doesn't have the role
export function requireRole(role: User['role']): void {
  requireAuth();
  
  if (!hasRole(role)) {
    throw new Error(`Role ${role} required`);
  }
}

// Get access token
export function getAccessToken(): string | null {
  return storage.getToken();
}

// ============================================================================
// Default Export - Auth Client API
// ============================================================================

export const authClient = {
  // Authentication
  login,
  register,
  logout,
  
  // Session Management
  getCurrentUser,
  isAuthenticated,
  fetchCurrentUser,
  getAuthState,
  
  // Authorization
  hasRole,
  hasAnyRole,
  requireAuth,
  requireRole,
  
  // Utilities
  getAccessToken,
};

export default authClient;
