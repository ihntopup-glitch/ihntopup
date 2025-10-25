'use client';

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAuthContext } from './AuthContext';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getFCMToken } from '@/lib/firebase/messaging';

const NotificationContext = createContext<null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { appUser } = useAuthContext();
  const firestore = useFirestore();

  const handleNotifications = useCallback(async () => {
    // Only admins should get notification prompts and have their tokens saved.
    if (!appUser || !appUser.isAdmin || !firestore) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        console.log('Notification permission granted.');
        const token = await getFCMToken();
        if (token) {
          console.log('FCM Token:', token);
          const userRef = doc(firestore, 'users', appUser.id);
          // Only update the token if it's different from the one in the database
          // or if it doesn't exist.
          if (appUser.fcmToken !== token) {
            updateDocumentNonBlocking(userRef, { fcmToken: token });
          }
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (error) {
      console.error('An error occurred while setting up notifications.', error);
    }
  }, [appUser, firestore]);

  useEffect(() => {
    // We run this effect whenever the appUser object changes.
    // This ensures that when an admin logs in, we try to get their notification token.
    handleNotifications();
  }, [appUser, handleNotifications]);

  return (
    <NotificationContext.Provider value={null}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
