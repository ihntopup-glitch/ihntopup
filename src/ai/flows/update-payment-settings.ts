'use server';
/**
 * @fileOverview A backend flow to securely update payment settings.
 *
 * - updatePaymentSettings - A function that securely updates the payment mode.
 * - UpdatePaymentSettingsInput - The input type for the updatePaymentSettings function.
 * - UpdatePaymentSettingsOutput - The return type for the updatePaymentSettings function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}
const adminFirestore = getFirestore();

const UpdatePaymentSettingsInputSchema = z.object({
  mode: z.enum(['manual', 'automatic']),
});
export type UpdatePaymentSettingsInput = z.infer<typeof UpdatePaymentSettingsInputSchema>;

const UpdatePaymentSettingsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type UpdatePaymentSettingsOutput = z.infer<typeof UpdatePaymentSettingsOutputSchema>;

export async function updatePaymentSettings(input: UpdatePaymentSettingsInput): Promise<UpdatePaymentSettingsOutput> {
  return updatePaymentSettingsFlow(input);
}

const updatePaymentSettingsFlow = ai.defineFlow(
  {
    name: 'updatePaymentSettingsFlow',
    inputSchema: UpdatePaymentSettingsInputSchema,
    outputSchema: UpdatePaymentSettingsOutputSchema,
  },
  async ({ mode }) => {
    try {
      const settingsRef = adminFirestore.collection('settings').doc('payment');
      await settingsRef.set({ mode: mode });
      return { success: true, message: 'Payment settings updated successfully.' };
    } catch (error: any) {
        console.error("Error in updatePaymentSettingsFlow:", error);
        return { success: false, message: error.message || 'An unknown error occurred while updating payment settings.' };
    }
  }
);
