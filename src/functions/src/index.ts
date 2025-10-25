import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as webpush from "web-push";

admin.initializeApp();

// It's safer to check if the config and keys exist.
if (functions.config().vapid && functions.config().vapid.public_key && functions.config().vapid.private_key) {
  webpush.setVapidDetails(
    "mailto:ihntopup@gmail.com",
    functions.config().vapid.public_key,
    functions.config().vapid.private_key
  );
} else {
    console.warn("VAPID keys not found in Firebase Functions config. Push notifications will not work.");
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
      url: `/admin/orders` // URL to open on click
    });

    try {
      const subscriptionsSnapshot = await admin.firestore().collection("admin_subscriptions").get();
      
      const notificationPromises = subscriptionsSnapshot.docs.map(async (doc) => {
        const subscription = doc.data();
        try {
          // Check if VAPID details are set before trying to send.
          if (webpush.getVapidDetails()) {
             await webpush.sendNotification(subscription, payload);
          } else {
             console.error("Cannot send notification because VAPID details are not set.");
          }
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
      console.log("Notifications sent successfully (or attempted).");
    } catch (error) {
      console.error("Error fetching subscriptions or sending notifications:", error);
    }
  });
