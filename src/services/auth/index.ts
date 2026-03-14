
import { register } from './registerService';
import { login } from './loginService';
import { getCurrentUser } from './userService';
import { logout } from './logoutService';

export const authApiService = {
  register,
  login,
  getCurrentUser,
  logout
};

export * from './registerService';
export * from './loginService';
export * from './userService';
export * from './logoutService';
export * from './apiHelpers';
