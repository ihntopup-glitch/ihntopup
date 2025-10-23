'use server';
/**
 * @fileOverview A backend flow to securely handle wallet top-up requests.
 *
 * - handleWalletRequest - A function that securely updates a user's wallet balance
 *   and the request status.
 * - HandleWalletRequestInput - The input type for the handleWalletRequest function.
 * - HandleWalletRequestOutput - The return type for the handleWalletRequest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}
const adminFirestore = getFirestore();

const HandleWalletRequestInputSchema = z.object({
  requestId: z.string().describe('The ID of the wallet top-up request document.'),
  userId: z.string().describe('The ID of the user whose wallet is to be updated.'),
  amount: z.number().describe('The amount to add to the wallet.'),
  action: z.enum(['approve', 'reject']).describe('The action to perform on the request.'),
});
export type HandleWalletRequestInput = z.infer<typeof HandleWalletRequestInputSchema>;

const HandleWalletRequestOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type HandleWalletRequestOutput = z.infer<typeof HandleWalletRequestOutputSchema>;

export async function handleWalletRequest(input: HandleWalletRequestInput): Promise<HandleWalletRequestOutput> {
  return handleWalletRequestFlow(input);
}

const handleWalletRequestFlow = ai.defineFlow(
  {
    name: 'handleWalletRequestFlow',
    inputSchema: HandleWalletRequestInputSchema,
    outputSchema: HandleWalletRequestOutputSchema,
  },
  async ({ requestId, userId, amount, action }) => {
    try {
      const requestRef = adminFirestore.doc(`wallet_top_up_requests/${requestId}`);
      const userRef = adminFirestore.doc(`users/${userId}`);

      // Use a transaction to ensure atomicity
      await adminFirestore.runTransaction(async (transaction) => {
        const requestDoc = await transaction.get(requestRef);
        if (!requestDoc.exists || requestDoc.data()?.status !== 'Pending') {
          throw new Error('Request not found or already processed.');
        }

        if (action === 'approve') {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists) {
            throw new Error(`User with ID ${userId} not found.`);
          }
          transaction.update(userRef, {
            walletBalance: FieldValue.increment(amount),
          });
          transaction.update(requestRef, {
            status: 'Approved',
          });
        } else { // action === 'reject'
          transaction.update(requestRef, { status: 'Rejected' });
        }
      });

      if (action === 'approve') {
        return { success: true, message: `Request approved. ৳${amount} added to user's wallet.` };
      } else {
        return { success: true, message: 'Request has been rejected.' };
      }

    } catch (error: any) {
      console.error("Error in handleWalletRequestFlow:", error);
      // Provide a more specific error message if available
      if (error.code === 5) { // NOT_FOUND
         return { success: false, message: `Operation failed: A required document was not found. Please check if user ID '${userId}' and request ID '${requestId}' are correct.` };
      }
      return { success: false, message: error.message || 'An unknown error occurred.' };
    }
  }
);
