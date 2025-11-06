'use client';

import type { Order, WalletTopUpRequest } from './data';

async function sendTelegramMessage(messageText: string) {
    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const groupId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;

    if (!botToken || !groupId) {
        console.error("Telegram environment variables are not set.");
        return;
    }

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


export async function sendOrderAlert(order: Order) {
  const date = new Date(order.orderDate).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const messageText = [
    `🛍️ *New Order Alert* 🛍️`,
    `-----------------------------------`,
    `👤 *User:* ${order.userName}`,
    `🆔 *Order ID:* \`${order.id}\``,
    `💎 *Product:* ${order.productName} - ${order.productOption}`,
    `UID: \`${order.gameUid}\``,
    `💰 *Amount:* ${order.totalAmount}৳`,
    `💳 *Method:* ${order.paymentMethod}`,
    `📦 *Status:* ${order.status}`,
    `📅 *Date:* ${date}`,
  ].join('\n');

  await sendTelegramMessage(messageText);
}


export async function sendWalletRequestAlert(request: WalletTopUpRequest) {
    const date = new Date(request.requestDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    const messageText = [
        `💰 *New Wallet Top-Up Request* 💰`,
        `-----------------------------------`,
        `👤 *User:* ${request.userEmail}`,
        `🆔 *Request ID:* \`${request.id}\``,
        `💵 *Amount:* ${request.amount}৳`,
        `💳 *Method:* ${request.method}`,
        `📞 *Sender:* \`${request.senderPhone}\``,
        `#️⃣ *TrxID:* \`${request.transactionId || 'N/A'}\``,
        `📅 *Date:* ${date}`,
    ].join('\n');

    await sendTelegramMessage(messageText);
}
