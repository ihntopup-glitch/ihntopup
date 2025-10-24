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

const HandleWalletRequestInputSchema = z.object({
  requestId: z.string().describe('The ID of the wallet top-up request.'),
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
  async ({ requestId, action }) => {
    try {
        const requestRef = adminFirestore.collection('wallet_top_up_requests').doc(requestId);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            throw new Error(`Request with ID ${requestId} not found.`);
        }

        const requestData = requestDoc.data();

        if (requestData?.status !== 'Pending') {
             throw new Error('This request has already been processed and is no longer pending.');
        }

        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        
        await requestRef.update({ status: newStatus });
        
        return {
            success: true,
            message: `Request successfully ${newStatus.toLowerCase()}.`
        };

    } catch (error: any) {
        console.error("Error in handleWalletRequestFlow:", error);
        return {
            success: false,
            message: error.message || 'An unknown error occurred during the operation.'
        };
    }
  }
);
