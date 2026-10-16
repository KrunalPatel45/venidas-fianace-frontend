
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = sessionStorage.getItem('vf_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.me();

      if (!response.data?.data) {
        throw new Error('Invalid user response.');
      }

      setUser(response.data.data);
    } catch (error) {
      sessionStorage.removeItem('vf_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(email, password) {
    const response = await authApi.login(
      email.trim(),
      password
    );

    const token = response.data?.data?.token;
    const loggedInUser = response.data?.data?.user;

    if (!token || !loggedInUser) {
      throw new Error(
        'Invalid login response from Laravel API.'
      );
    }

    sessionStorage.setItem('vf_token', token);

    setUser(loggedInUser);

    return loggedInUser;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      sessionStorage.removeItem('vf_token');
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.'
    );
  }

  return context;
}
