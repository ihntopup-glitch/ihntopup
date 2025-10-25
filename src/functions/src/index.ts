import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as webpush from "web-push";

admin.initializeApp();

if (functions.config().vapid) {
  webpush.setVapidDetails(
    "mailto:ihntopup@gmail.com",
    functions.config().vapid.public_key,
    functions.config().vapid.private_key
  );
}

export const onOrderCreated = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap) => {
    const order = snap.data();

    // Notification payload
    const payload = JSON.stringify({
      title: "🛍️ New Order Received!",
      body: `Product: ${order.productName} - ${order.productOption} for ৳${order.totalAmount}`,
      icon: "https://i.imgur.com/bJH9BH5.png",
    });

    try {
      const subscriptionsSnapshot = await admin.firestore().collection("admin_subscriptions").get();
      
      const notificationPromises = subscriptionsSnapshot.docs.map(async (doc) => {
        const subscription = doc.data();
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (error: any) {
          // If a subscription is invalid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            console.log("Subscription has expired or is invalid. Removing...", doc.id);
            await doc.ref.delete();
          } else {
            console.error("Failed to send notification to", doc.id, error);
          }
        }
      });
      
      await Promise.all(notificationPromises);
      console.log("Notifications sent successfully.");
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  });
