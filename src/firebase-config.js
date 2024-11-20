import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCSYN4H4HWlLtb490kwN1xOO1kHJ9HEfAA",
  authDomain: "gfy-golf-223c9.firebaseapp.com",
  projectId: "gfy-golf-223c9",
  storageBucket: "gfy-golf-223c9.firebasestorage.app",
  messagingSenderId: "370898390679",
  appId: "1:370898390679:web:bf518b583384e5c46023d2"
  // We can skip measurementId unless you want analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: vapidKey
      });
      console.log('Notification Token:', token);
      return token;
    }
  } catch (err) {
    console.error('Notification permission error:', err);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});

export default app;