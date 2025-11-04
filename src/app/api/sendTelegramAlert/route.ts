import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const groupId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;

    if (!botToken || !groupId || !message) {
      return NextResponse.json({ error: 'Missing bot token, group ID, or message' }, { status: 400 });
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: groupId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json({ error: 'Failed to send message to Telegram', details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Alert sent successfully' });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
