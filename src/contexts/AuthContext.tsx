'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/data';

type AuthContextType = {
  isLoggedIn: boolean;
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }
  
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(firestore, 'users', user.uid);
        
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setAppUser(docSnap.data() as AppUser);
          } else {
            setAppUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setAppUser(null);
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setFirebaseUser(null);
        setAppUser(null);
        setLoading(false);
      }
    });
  
    return () => unsubscribeAuth();
  }, [auth, firestore]);
  
  const logout = useCallback(async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [auth]);
  
  const value = useMemo(
    () => ({
      isLoggedIn: !!firebaseUser,
      firebaseUser,
      appUser,
      loading,
      logout,
    }),
    [firebaseUser, appUser, loading, logout]
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