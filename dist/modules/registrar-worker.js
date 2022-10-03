"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registrarWorker = registrarWorker;

function registrarWorker() {
  self.addEventListener('message', e => {
    try {
      registerUserDevice(e.data);
      intervalUpdateStatus(e.data);
    } catch (err) {
      console.error('Error', err);
    }
  });

  function registerUserDevice(data) {
    request(data.requestPubKey).then(response => response.json()).then(result => {
      console.log('III-User pubkey:' + result.publicKey);
      data.requestRegister.body = Object.assign(data.requestRegister.body, {
        PublicKey: result.publicKey
      });
      request(data.requestRegister).then(response => response.status).then(result => {
        console.log('IV-Register device success', result);
      });
    });
  }

  function intervalUpdateStatus(data) {
    setInterval(() => {
      data.requestKeepAlive.url = data.requestKeepAlive.url.replace('{deviceId}', data.requestKeepAlive.body.deviceId);
      request(data.requestKeepAlive).then(response => response.status).then(data => {
        console.log('V-Update status success ', data);
      }).catch(error => {
        console.error(error);
      });
    }, 1000 * 60 * 0.5); // 0.5 minute
  }

  function request(req) {
    return fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body)
    });
  }
}