/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Initialize Firebase Admin SDK
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

// Define the Cloud Function
exports.sendOrderNotification = onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log("No data associated with the event");
    return;
  }
  const orderData = snapshot.data();

  logger.log("New order created:", event.params.orderId, orderData);

  try {
    // 1. Get all admin users
    const adminsSnapshot = await db.collection("users").where("isAdmin", "==", true).get();

    if (adminsSnapshot.empty) {
      logger.log("No admin users found to send notifications to.");
      return;
    }

    // 2. Collect all their FCM tokens
    const tokens: string[] = [];
    adminsSnapshot.forEach((adminDoc) => {
      const adminData = adminDoc.data();
      if (adminData.fcmToken) {
        tokens.push(adminData.fcmToken);
      }
    });

    if (tokens.length === 0) {
      logger.log("No FCM tokens found for admin users.");
      return;
    }
    
    logger.log(`Found ${tokens.length} admin tokens to send notification to.`);

    // 3. Create the notification message
    const message = {
      notification: {
        title: "🛍️ New Order Received!",
        body: `Order for ${orderData.productName} - ${orderData.productOption} worth ৳${orderData.totalAmount} has been placed.`,
      },
      webpush: {
        notification: {
          icon: 'https://i.imgur.com/bJH9BH5.png',
        },
        fcm_options: {
            link: `/admin/orders` // Link to open when notification is clicked
        }
      },
      tokens: tokens,
    };

    // 4. Send the message to all admin tokens
    const response = await messaging.sendEachForMulticast(message);
    logger.log("Successfully sent message:", response);

    // Log any failures
    if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(tokens[idx]);
            }
        });
        logger.warn('List of failed tokens:', failedTokens);
    }

  } catch (error) {
    logger.error("Error sending order notification:", error);
  }
});
