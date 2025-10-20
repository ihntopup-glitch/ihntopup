'use server';

import { z } from 'zod';

const ValidateGameUidInputSchema = z.object({
  uid: z.string().min(1, 'UID is required.'),
});

const GarenaResponseSchema = z.object({
  nickname: z.string().optional(), // Make nickname optional to handle cases where it might be missing
  error_msg: z.string().optional(), // Capture error message from Garena
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
    const parsedData = GarenaResponseSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: 'Could not parse player information.' };
    }

    if (parsedData.data.error_msg) {
        return { success: false, error: parsedData.data.error_msg };
    }

    if (parsedData.data.nickname) {
        return { success: true, inGameName: parsedData.data.nickname };
    }
    
    // Fallback error if no nickname and no specific error message
    return { success: false, error: 'Player not found or invalid UID.' };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Garena UID Validation Error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
