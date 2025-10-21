'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/data';

type User = FirebaseUser & AppUser;

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      setLoading(false);
      return;
    }
  
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // We have a firebase user, so authentication is not loading anymore
        setLoading(false);
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        
        // Listen for real-time updates to the user document
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ ...firebaseUser, ...docSnap.data() } as User);
          } else {
            // This case might happen for a brand new user before their doc is created.
            // We can set a minimal user object or wait for creation.
            setUser(firebaseUser as User); 
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUser(firebaseUser as User); // Fallback to firebase user on listener error
        });

        // Return a cleanup function to unsubscribe from the document listener
        return () => unsubDoc();

      } else {
        setUser(null);
        setLoading(false);
      }
    });
  
    // Return a cleanup function to unsubscribe from the auth state listener
    return () => unsubscribe();
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
      isLoggedIn: !!user,
      user,
      loading,
      logout,
    }),
    [user, loading, logout]
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
