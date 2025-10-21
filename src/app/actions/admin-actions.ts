'use server';

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import { z } from 'zod';
import { auth } from 'firebase-admin';

// Initialize Firebase Admin SDK if it hasn't been already.
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Define Zod schema for category input validation
const CategoryInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().or(z.literal('')),
  status: z.enum(['Active', 'Draft']),
});

/**
 * A Server Action to create a new category.
 * It verifies if the user is an admin before proceeding.
 * @param categoryData - The data for the new category.
 * @param uid - The UID of the user making the request.
 */
export async function createCategoryAction(
  categoryData: unknown,
  uid: string | null
) {
  'use strict';
  
  if (!uid) {
    return { success: false, error: 'Authentication token is missing.' };
  }

  try {
    // 1. Get the user record from Firebase Auth
    const userRecord = await auth().getUser(uid);

    // 2. Check if the user has an admin custom claim or is an admin in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    const isFirestoreAdmin = userDoc.exists && userDoc.data()?.isAdmin === true;
    const isAuthAdmin = userRecord.customClaims?.admin === true;

    if (!isFirestoreAdmin && !isAuthAdmin) {
      return { success: false, error: 'You do not have permission to perform this action.' };
    }

    // 3. Validate the input data against the Zod schema
    const validatedData = CategoryInputSchema.safeParse(categoryData);
    if (!validatedData.success) {
      return { success: false, error: 'Invalid input data.', details: validatedData.error.errors };
    }
    
    // 4. If admin and data is valid, add the new category to Firestore
    const docRef = await db.collection('categories').add(validatedData.data);
    
    return { success: true, id: docRef.id };

  } catch (error: any) {
    console.error('Error in createCategoryAction:', error);
    // Distinguish between auth errors and other errors
    if (error.code?.startsWith('auth/')) {
       return { success: false, error: 'Authentication failed. Please log in again.' };
    }
    return { success: false, error: 'An unexpected server error occurred.' };
  }
}
