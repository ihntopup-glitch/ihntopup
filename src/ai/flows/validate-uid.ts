'use server';

/**
 * @fileOverview A flow to validate a game UID and return the in-game name.
 *
 * - validateGameUid - A function that handles the UID validation.
 * - ValidateGameUidInput - The input type for the validateGameUid function.
 * - ValidateGameUidOutput - The return type for the validateGameUid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ValidateGameUidInputSchema = z.object({
  uid: z.string().describe('The Game User ID to validate.'),
});
export type ValidateGameUidInput = z.infer<typeof ValidateGameUidInputSchema>;

export const ValidateGameUidOutputSchema = z.object({
  inGameName: z.string().optional().describe('The in-game name of the player.'),
});
export type ValidateGameUidOutput = z.infer<typeof ValidateGameUidOutputSchema>;

export async function validateGameUid(input: ValidateGameUidInput): Promise<ValidateGameUidOutput> {
  return validateGameUidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateGameUidPrompt',
  input: {schema: ValidateGameUidInputSchema},
  output: {schema: ValidateGameUidOutputSchema},
  prompt: `You are a game user validation assistant. Based on the provided UID, you must return the corresponding in-game name.
  
  For the purpose of this simulation, use the following logic:
  - If the UID is '123456789', the in-game name is "ProGamer123".
  - If the UID is '987654321', the in-game name is "NightFury".
  - If the UID is '112233445', the in-game name is "ShadowStriker".
  - For any other UID that is a 9-digit number, generate a plausible but fake in-game name like "Player" followed by the last 4 digits of the UID.
  - If the UID is not a 9-digit number, do not return an inGameName.
  
  UID: {{{uid}}}`,
});

const validateGameUidFlow = ai.defineFlow(
  {
    name: 'validateGameUidFlow',
    inputSchema: ValidateGameUidInputSchema,
    outputSchema: ValidateGameUidOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
