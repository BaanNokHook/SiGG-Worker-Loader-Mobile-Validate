"use strict";

importScripts("https://js.pusher.com/beams/service-worker.js");

PusherPushNotifications.onNotificationReceived = ({
  pushEvent,
  payload
}) => {
  const broadcast = new BroadcastChannel('txn-validator');
  broadcast.postMessage({
    type: 'VALIDATE_TXN',
    payload: {
      txnId: payload.notification.body
    }
  });
};