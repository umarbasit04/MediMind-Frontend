import { create } from 'zustand';
import { api, ApiError } from './api';
import { clearStoredToken, getStoredToken, setStoredToken } from './storage';
import { User } from './types';

type AuthState = {
  token: string | null;
  user: User | null;
  hydrate: () => Promise<void>;
  signIn: (auth: { token: string; user: User }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrate: async () => {
    const token = await getStoredToken();
    if (!token) return;
    try {
      const { user } = await api.me(token);
      set({ token, user });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'unauthorized') await clearStoredToken();
      else throw error;
    }
  },
  signIn: async ({ token, user }) => {
    await setStoredToken(token);
    set({ token, user });
  },
  signOut: async () => {
    await clearStoredToken();
    set({ token: null, user: null });
  },
}));