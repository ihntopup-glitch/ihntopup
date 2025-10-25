'use client';

import { getMessaging, getToken } from 'firebase/messaging';
import { initializeFirebase } from '@/firebase';

// Get a token.
export const getFCMToken = async () => {
  const { firebaseApp } = initializeFirebase();
  const messaging = getMessaging(firebaseApp);
  
  // You need to have a VAPID key for this to work.
  // You can generate one in your Firebase project settings.
  const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

  if (!VAPID_KEY) {
      console.error("VAPID key is missing. Please add NEXT_PUBLIC_VAPID_KEY to your environment variables.");
      return null;
  }

  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
};
