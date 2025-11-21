import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { apiClient, Profile } from '@/lib/api';
import { apiFetch, clearTokens, getStoredTokens, saveTokens } from '@/lib/http';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<string | null>;
  updatePassword: (password: string, options?: { currentPassword?: string; resetToken?: string }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const tokens = getStoredTokens();
      if (!tokens) {
        setLoading(false);
        return;
      }

      try {
        const profile = await apiClient.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('[auth] falha ao restaurar sessão', error);
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const tokens = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/token', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    saveTokens(tokens);
    const profile = await apiClient.getProfile();
    setUser(profile);
  }, []);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: `${firstName} ${lastName}`.trim() || email,
      }),
    });

    await login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    clearTokens();
    setUser(null);
  }, []);

  const sendPasswordResetEmail = async (email: string) => {
    const data = await apiFetch<{ reset_token: string | null }>('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const token = data?.reset_token || null;
    if (token) {
      sessionStorage.setItem('investorion.reset_token', token);
    }
    return token;
  };

  const updatePassword = async (password: string, options?: { currentPassword?: string; resetToken?: string }) => {
    if (options?.resetToken) {
      const tokens = await apiFetch<{ access_token: string; refresh_token: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ reset_token: options.resetToken, new_password: password }),
      });
      saveTokens(tokens);
      const profile = await apiClient.getProfile();
      setUser(profile);
      return;
    }

    if (!options?.currentPassword) {
      throw new Error('Informe a senha atual para alterar a senha.');
    }

    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: options.currentPassword, new_password: password }),
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    sendPasswordResetEmail,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
