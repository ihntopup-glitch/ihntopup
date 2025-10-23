'use server';
/**
 * @fileOverview A backend flow to securely handle referral point distribution.
 *
 * - handleReferral - A function that securely updates the referrer's points.
 * - HandleReferralInput - The input type for the handleReferral function.
 * - HandleReferralOutput - The return type for the handleReferral function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminFirestore } from '@/lib/firebase-admin';
import type { ReferralSettings } from '@/lib/data';


const HandleReferralInputSchema = z.object({
  referrerId: z.string().describe('The ID of the user who referred someone.'),
  refereeId: z.string().describe('The ID of the new user who was referred.'),
});
export type HandleReferralInput = z.infer<typeof HandleReferralInputSchema>;

const HandleReferralOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type HandleReferralOutput = z.infer<typeof HandleReferralOutputSchema>;

export async function handleReferral(input: HandleReferralInput): Promise<HandleReferralOutput> {
  return handleReferralFlow(input);
}

const handleReferralFlow = ai.defineFlow(
  {
    name: 'handleReferralFlow',
    inputSchema: HandleReferralInputSchema,
    outputSchema: HandleReferralOutputSchema,
  },
  async ({ referrerId, refereeId }) => {
    try {
      const settingsRef = adminFirestore.collection('settings').doc('referral');
      const referrerRef = adminFirestore.collection('users').doc(referrerId);

      const [settingsDoc, referrerDoc] = await Promise.all([settingsRef.get(), referrerRef.get()]);

      if (!referrerDoc.exists) {
        return { success: false, message: `Referrer with ID ${referrerId} not found.` };
      }

      if (!settingsDoc.exists) {
        return { success: false, message: 'Referral settings not found.' };
      }

      const settings = settingsDoc.data() as ReferralSettings;
      const referrerData = referrerDoc.data();
      const referrerBonus = settings.referrerBonus || 0;

      if (referrerBonus > 0) {
        const currentPoints = referrerData?.points || 0;
        await referrerRef.update({
          points: currentPoints + referrerBonus,
        });
      }

      return { success: true, message: `Referrer points updated successfully for ${referrerId}.` };
    } catch (error: any) {
        console.error("Error in handleReferralFlow:", error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
  }
);