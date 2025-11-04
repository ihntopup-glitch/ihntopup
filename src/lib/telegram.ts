'use client';

import type { Order } from './data';

export async function sendTelegramAlert(order: Order) {
  const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const groupId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;

  if (!botToken || !groupId) {
    console.error("Telegram environment variables are not set.");
    return;
  }
  
  const date = new Date(order.orderDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const messageText = [
    `🚨 *New Order Alert* 🚨`,
    `-----------------------------------`,
    `👤 *User:* ${order.userName}`,
    `🆔 *Order ID:* \`${order.id}\``,
    `💎 *Product:* ${order.productName} - ${order.productOption}`,
    `💰 *Amount:* ${order.totalAmount}৳`,
    `📦 *Status:* ${order.status}`,
    `📅 *Date:* ${date}`,
  ].join('\n');

  try {
    const response = await fetch('/api/sendTelegramAlert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messageText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send Telegram alert');
    }

  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
}
