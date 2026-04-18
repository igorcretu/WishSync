import React from 'react';
import { auth } from './api';
import type { ApiUser } from './api';

interface AuthCtx {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; nickname: string; birthday?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (u: ApiUser) => void;
}

const AuthContext = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<ApiUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('ws-token');
    if (!token) { setLoading(false); return; }
    auth.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('ws-token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    localStorage.setItem('ws-token', res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; name: string; nickname: string; birthday?: string }) => {
    const res = await auth.register(data);
    localStorage.setItem('ws-token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('ws-token');
    localStorage.removeItem('ws-view');
    setUser(null);
  };

  const updateUser = (u: ApiUser) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
