"use client";

import { userProfile } from '@/lib/data';
import type { ReactNode } from 'react';
import { createContext, useState, useCallback, useMemo } from 'react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

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
