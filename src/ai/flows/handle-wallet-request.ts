'use server';
/**
 * @fileOverview A backend flow to securely handle wallet top-up requests.
 *
 * - handleWalletRequest - A function that securely approves or rejects a wallet request.
 * - HandleWalletRequestInput - The input type for the handleWalletRequest function.
 * - HandleWalletRequestOutput - The return type for the handleWalletRequest function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { WalletTopUpRequest, User, WalletTransaction } from '@/lib/data';

const HandleWalletRequestInputSchema = z.object({
  requestId: z.string().describe('The ID of the wallet top-up request.'),
  userId: z.string().describe("The ID of the user whose wallet is being updated."),
  amount: z.number().min(0).describe("The amount to credit to the user's wallet if approved."),
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
        await adminFirestore.runTransaction(async (transaction) => {
            const requestRef = adminFirestore.collection('wallet_top_up_requests').doc(requestId);
            const userRef = adminFirestore.collection('users').doc(userId);

            const requestDoc = await transaction.get(requestRef);
            
            if (!requestDoc.exists) {
                throw new Error(`Request with ID ${requestId} not found.`);
            }

            const requestData = requestDoc.data() as WalletTopUpRequest;
            
            if (requestData.status !== 'Pending') {
                 throw new Error('This request has already been processed and is no longer pending.');
            }
            
            if (action === 'approve') {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw new Error(`User with ID ${userId} not found.`);
                }
                
                // 1. Update user's wallet balance
                transaction.update(userRef, {
                    walletBalance: FieldValue.increment(amount)
                });

                // 2. Create a new transaction log in the subcollection
                const transactionRef = userRef.collection('transactions').doc();
                const newTransaction: Omit<WalletTransaction, 'id'> = {
                    userId: userId,
                    type: 'credit',
                    amount: amount,
                    transactionDate: new Date().toISOString(),
                    status: 'Completed',
                    paymentMethod: requestData.method,
                    description: `Wallet top-up from request ${requestId}`,
                };
                transaction.set(transactionRef, newTransaction);
                
                // 3. Update the request status
                transaction.update(requestRef, { status: 'Approved' });
            } else { // action === 'reject'
                // Just update the request status
                transaction.update(requestRef, { status: 'Rejected' });
            }
        });
        
        return {
            success: true,
            message: `Request successfully ${action === 'approve' ? 'approved' : 'rejected'}.`
        };

    } catch (error: any) {
        console.error("Error in handleWalletRequestFlow:", error);
        // Ensure we return a consistent output format on error
        return {
            success: false,
            message: error.message || 'An unknown error occurred during the transaction.'
        };
    }
  }
);
