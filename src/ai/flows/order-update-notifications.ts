'use server';

/**
 * @fileOverview Order update notifications AI agent.
 *
 * - orderUpdateNotifications - A function that handles the order update notification process.
 * - OrderUpdateNotificationsInput - The input type for the orderUpdateNotifications function.
 * - OrderUpdateNotificationsOutput - The return type for the orderUpdateNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrderUpdateNotificationsInputSchema = z.object({
  orderId: z.string().describe('The ID of the order.'),
  orderStatus: z.string().describe('The current status of the order.'),
  possibleUpdates: z.array(z.string()).describe('An array of possible update messages.'),
});
export type OrderUpdateNotificationsInput = z.infer<typeof OrderUpdateNotificationsInputSchema>;

const OrderUpdateNotificationsOutputSchema = z.object({
  notificationMessage: z.string().describe('The selected notification message to send to the user.'),
});
export type OrderUpdateNotificationsOutput = z.infer<typeof OrderUpdateNotificationsOutputSchema>;

export async function orderUpdateNotifications(input: OrderUpdateNotificationsInput): Promise<OrderUpdateNotificationsOutput> {
  return orderUpdateNotificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'orderUpdateNotificationsPrompt',
  input: {schema: OrderUpdateNotificationsInputSchema},
  output: {schema: OrderUpdateNotificationsOutputSchema},
  prompt: `You are an AI assistant that selects the most relevant order update message to send to a user.\n
  You are given the current order status and a list of possible update messages. Select the single best message to send to the user.\n
  Order ID: {{{orderId}}}\n  Order Status: {{{orderStatus}}}\n  Possible Updates:\n  {{#each possibleUpdates}}\n  - {{{this}}}\n  {{/each}}\n  \n`,
});

const orderUpdateNotificationsFlow = ai.defineFlow(
  {
    name: 'orderUpdateNotificationsFlow',
    inputSchema: OrderUpdateNotificationsInputSchema,
    outputSchema: OrderUpdateNotificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
