import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the app is initialized only once
if (!getApps().length) {
    try {
        // This will work in a Google Cloud environment (like Firebase App Hosting)
        initializeApp({
            credential: applicationDefault(),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (e) {
        console.error("Failed to initialize Firebase Admin SDK:", e);
        // Fallback for local development if needed, though applicationDefault should be preferred.
    }
}

export const adminFirestore = getFirestore();
