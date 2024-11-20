importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCSYN4H4HWlLtb490kwN1xOO1kHJ9HEfAA",
  authDomain: "gfy-golf-223c9.firebaseapp.com",
  projectId: "gfy-golf-223c9",
  storageBucket: "gfy-golf-223c9.firebasestorage.app",
  messagingSenderId: "370898390679",
  appId: "1:370898390679:web:bf518b583384e5c46023d2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});