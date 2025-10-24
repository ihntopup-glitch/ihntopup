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
import { doc, updateDoc } from 'firebase/firestore';


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
        
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        
        // Directly update the document. This is simpler and avoids transaction complexity
        // that was causing issues.
        await requestRef.update({ status: newStatus });
        
        return {
            success: true,
            message: `Request successfully ${newStatus.toLowerCase()}.`
        };

    } catch (error: any) {
        console.error("Error in handleWalletRequestFlow:", error);
        // Check for specific error types if needed
        if (error.code === 'NOT_FOUND') {
             return {
                success: false,
                message: `Error: The request document with ID '${requestId}' could not be found. It may have been deleted.`
            };
        }
        return {
            success: false,
            message: error.message || 'An unknown error occurred during the operation.'
        };
    }
  }
);
