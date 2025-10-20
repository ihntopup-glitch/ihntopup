'use server';

import { z } from 'zod';

const ValidateGameUidInputSchema = z.object({
  uid: z.string().min(1, 'UID is required.'),
});

const GarenaResponseSchema = z.object({
  nickname: z.string(),
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

    if (!response.ok) {
      // Garena API often returns non-200 for invalid UIDs
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.error_msg || 'Player not found or invalid UID.' };
    }
    
    const data = await response.json();
    const parsedData = GarenaResponseSchema.safeParse(data);

    if (!parsedData.success) {
      return { success: false, error: 'Could not parse player information.' };
    }

    return { success: true, inGameName: parsedData.data.nickname };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Garena UID Validation Error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
