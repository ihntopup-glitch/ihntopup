'use server';

import { z } from 'zod';

const ValidateGameUidInputSchema = z.object({
  uid: z.string().min(1, 'UID is required.'),
});

const GarenaResponseSchema = z.object({
  nickname: z.string().optional(),
  error_msg: z.string().optional(),
});

export async function validateGarenaUid(uid: string) {
  try {
    const validatedInput = ValidateGameUidInputSchema.parse({ uid });

    const response = await fetch('https://shop.garena.sg/api/auth/player_id_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: 100067, // Free Fire App ID
        login_id: validatedInput.uid,
      }),
    });

    const data = await response.json();
    
    // Use safeParse to handle potential validation errors gracefully
    const parsedData = GarenaResponseSchema.safeParse(data);

    if (!parsedData.success) {
      // Log the validation error for debugging if needed, but return a generic error to the user.
      console.error('Garena API response parsing error:', parsedData.error);
      return { success: false, error: 'Could not parse player information from Garena.' };
    }
    
    const { nickname, error_msg } = parsedData.data;

    if (error_msg) {
        // Return the specific error message from Garena
        return { success: false, error: error_msg };
    }
    
    if (nickname) {
        // Successfully found the player
        return { success: true, inGameName: nickname };
    }

    // Fallback error if neither nickname nor error_msg is present
    return { success: false, error: 'Player not found or invalid UID.' };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    // Catch fetch/network errors or other unexpected issues
    console.error('Garena UID Validation Error:', error);
    return { success: false, error: 'An unexpected error occurred while checking the UID.' };
  }
}
