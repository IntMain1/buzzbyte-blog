/**
 * AuthContext - Centralized Authentication State Management
 * 
 * Architecture: React Context + localStorage persistence
 * - Provides global auth state (user, token) to all components
 * - Persists auth data to localStorage for session continuity
 * - Syncs with server on init to ensure data freshness
 * - Handles token-based authentication with Laravel Sanctum
 * 
 * @author Omar Tarek
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../lib/api';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface User {
  id: number;
  name: string;
  email: string;
  image: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: FormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// ─────────────────────────────────────────────────────────────
// Storage Helpers
// ─────────────────────────────────────────────────────────────
const STORAGE_KEYS = { TOKEN: 'token', USER: 'user' } as const;

const storage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  getUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  save: (token: string, user: User) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  updateUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage and sync with API
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = storage.getToken();
      const storedUser = storage.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Sync with server to get latest user data (including updated image)
        try {
          const { data } = await authApi.me();
          if (data.user) {
            storage.updateUser(data.user);
            setUser(data.user);
          }
        } catch {
          // Token might be invalid, clear auth state
          storage.clear();
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Auth handlers
  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    storage.save(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (formData: FormData) => {
    const { data } = await authApi.register(formData);
    storage.save(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors - token might already be invalid
    }
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    storage.updateUser(updatedUser);
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
