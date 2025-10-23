'use server';

/**
 * @fileOverview A flow for handling referral bonuses securely on the backend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import type { ReferralSettings } from '@/lib/data';

// Initialize Firebase Admin SDK if it hasn't been already.
if (!getApps().length) {
  initializeApp();
}

const HandleReferralInputSchema = z.object({
  referrerId: z.string().describe("The user ID of the person who referred the new user."),
  refereeId: z.string().describe("The user ID of the new user who just signed up."),
});

export type HandleReferralInput = z.infer<typeof HandleReferralInputSchema>;

export const handleReferralFlow = ai.defineFlow(
  {
    name: 'handleReferralFlow',
    inputSchema: HandleReferralInputSchema,
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ referrerId, refereeId }) => {
    const db = getFirestore();
    
    try {
      const settingsRef = db.doc('settings/referral');
      const referrerRef = db.doc(`users/${referrerId}`);

      const [settingsDoc, referrerDoc] = await Promise.all([
        settingsRef.get(),
        referrerRef.get()
      ]);

      if (!settingsDoc.exists) {
        throw new Error("Referral settings not found.");
      }
       if (!referrerDoc.exists) {
        throw new Error(`Referrer with ID ${referrerId} not found.`);
      }

      const settings = settingsDoc.data() as ReferralSettings;
      const referrerBonus = settings.referrerBonus || 0;

      if (referrerBonus > 0) {
        await referrerRef.update({
          points: FieldValue.increment(referrerBonus)
        });
        return { success: true, message: `Successfully awarded ${referrerBonus} points to referrer ${referrerId}.` };
      } else {
        return { success: true, message: 'No referrer bonus to award.' };
      }

    } catch (error: any) {
      console.error("Error in handleReferralFlow:", error);
      return { success: false, message: error.message || "An unknown error occurred." };
    }
  }
);

export async function handleReferral(input: HandleReferralInput): Promise<{ success: boolean; message: string; }> {
    return handleReferralFlow(input);
}
