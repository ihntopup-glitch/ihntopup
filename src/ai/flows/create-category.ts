'use server';

/**
 * @fileOverview A flow for creating a new category in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

const CategoryInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['Active', 'Draft']),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;

export const createCategoryFlow = ai.defineFlow(
  {
    name: 'createCategoryFlow',
    inputSchema: CategoryInputSchema,
    outputSchema: z.object({ id: z.string() }),
  },
  async (categoryData) => {
    // Initialize Firebase Admin SDK if it hasn't been already.
    // This ensures that the admin SDK is properly authenticated on the server.
    if (!getApps().length) {
      initializeApp();
    }
    const db = getFirestore();
    const categoriesRef = db.collection('categories');
    const docRef = await categoriesRef.add(categoryData);
    return { id: docRef.id };
  }
);

export async function createCategory(categoryData: CategoryInput): Promise<{ id: string }> {
    return createCategoryFlow(categoryData);
}
