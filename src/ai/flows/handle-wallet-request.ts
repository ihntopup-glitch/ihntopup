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
import { z } from 'zod';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


const HandleWalletRequestInputSchema = z.object({
  requestId: z.string().describe('The ID of the wallet top-up request document.'),
  userId: z.string().describe('The ID of the user whose wallet is to be updated.'),
  amount: z.number().describe('The amount to add to the wallet.'),
  action: z.enum(['approve', 'reject']).describe("The action to take: 'approve' or 'reject'."),
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
      const requestRef = adminFirestore.collection('wallet_top_up_requests').doc(requestId);
      const userRef = adminFirestore.collection('users').doc(userId);

      await adminFirestore.runTransaction(async (transaction) => {
        const requestDoc = await transaction.get(requestRef);

        if (!requestDoc.exists) {
          throw new Error(`Wallet request document with ID '${requestId}' not found.`);
        }
        
        const requestData = requestDoc.data();
        if (requestData?.status !== 'Pending') {
            throw new Error('This request has already been processed.');
        }

        if (action === 'approve') {
          const userDoc = await transaction.get(userRef);
           if (!userDoc.exists) {
              throw new Error(`User document with ID '${userId}' not found.`);
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
      
      const message = action === 'approve'
        ? 'ওয়ালেট সফলভাবে আপডেট করা হয়েছে এবং অনুরোধটি অনুমোদিত হয়েছে।'
        : 'অনুরোধটি বাতিল করা হয়েছে।';

      return { success: true, message: message };

    } catch (error: any) {
      console.error("Error in handleWalletRequestFlow:", error);
      // Provide a more specific error message back to the client.
      const errorMessage = error.message || 'একটি অজানা ত্রুটি ঘটেছে।';
      return { success: false, message: `অপারেশন ব্যর্থ হয়েছে: ${errorMessage}` };
    }
  }
);
