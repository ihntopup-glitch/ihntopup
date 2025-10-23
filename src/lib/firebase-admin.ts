import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure the app is initialized only once
if (!getApps().length) {
    try {
        // This will work in a Google Cloud environment (like Firebase App Hosting)
        initializeApp({
            credential: applicationDefault(),
        });
    } catch (e) {
        console.error("Failed to initialize with applicationDefault credentials. This is expected in local dev without GOOGLE_APPLICATION_CREDENTIALS.", e);
        // Fallback for local development if needed, though applicationDefault should be preferred.
    }
}

export const adminFirestore = getFirestore();
