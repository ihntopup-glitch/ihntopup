"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Auth, onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth } from '@/firebase'; // Assuming useAuth from firebase gives the auth instance
import { userProfile } from '@/lib/data';

type User = {
  uid: string;
  name: string | null;
  email: string | null;
  avatar: { src: string; hint: string };
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth(); // This is the Firebase Auth instance
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [auth]);

  const user: User | null = firebaseUser
    ? {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || userProfile.name,
        email: firebaseUser.email,
        avatar: { 
          src: firebaseUser.photoURL || userProfile.avatar.src,
          hint: userProfile.avatar.hint,
        },
      }
    : null;

  const value = useMemo(
    () => ({
      isLoggedIn: !!firebaseUser,
      user,
      firebaseUser,
      loading,
      logout,
    }),
    [firebaseUser, user, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
