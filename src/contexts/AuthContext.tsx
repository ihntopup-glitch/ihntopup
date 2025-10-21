"use client";

import { userProfile } from '@/lib/data';
import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useMemo, useEffect } from 'react';

type User = {
  name: string;
  email: string;
  avatar: { src: string; hint: string };
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // In a real app, you'd check for a session token here from localStorage.
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth === 'true') {
        setIsLoggedIn(true);
    }
  }, []);


  const login = useCallback(() => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  }, []);

  const user = isLoggedIn ? { name: userProfile.name, email: userProfile.email, avatar: userProfile.avatar } : null;

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      login,
      logout,
    }),
    [isLoggedIn, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
