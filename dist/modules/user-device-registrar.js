"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var PusherPushNotifications = _interopRequireWildcard(require("@pusher/push-notifications-web"));

var _registrarWorker = require("./registrar-worker");

var _validatorWorker = require("./validator-worker");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

async function _registerToPusherBeams(conf, uuid) {
  //Registering a service worker
  let promise = new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').then(function () {
        console.log('I-Service Worker Registered');
        const beamsClient = new PusherPushNotifications.Client({
          instanceId: conf.beams.instanceId
        });
        beamsClient.getUserId().then(userId => {
          // Check if the Beams user matches the user that is currently logged in
          if (userId !== uuid) {
            // Unregister for notifications
            return beamsClient.stop();
          }
        }).catch(error => {
          throw error;
        });
        const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
          url: conf.beams.authUrl
        });

        let _deviceId;

        beamsClient.start().then(beamsClient => beamsClient.getDeviceId()).then(deviceId => {
          _deviceId = deviceId;
          console.log('II-Successfully registered with Beams. Device ID:' + deviceId);
        }).then(() => {
          beamsClient.setUserId(uuid, beamsTokenProvider).then(() => {
            console.log('User ID has been set');
            resolve(_deviceId);
          }).catch(e => {
            reject(new Error('Could not authenticate with Beams:' + e));
          });
        }).catch(e => {
          reject(new Error('Could not get device id' + e));
        });
      });
    } else {
      reject(new Error('Service workers are not supported in this browser'));
    }
  });
  return promise;
}

function _createWorkerForRegisterUserDevice(conf, userAccount, deviceId) {
  //Start Registration
  let workerBlob = new Blob([_registrarWorker.registrarWorker.toString().replace(/^function .+\{?|\}$/g, '')], {
    type: 'text/javascript'
  });
  let workerBlobUrl = URL.createObjectURL(workerBlob);
  let worker = new Worker(workerBlobUrl);
  worker.postMessage({
    requestPubKey: {
      url: conf.wallet.getPubKeyUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        userUniqueId: userAccount._uuid,
        encryptMnemonic: userAccount._encryptedMnemonicPhrase,
        accountAddress: userAccount._accountAddress
      }
    },
    requestRegister: {
      url: conf.txnGateway.registerDeviceUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        UserId: userAccount._uuid,
        DeviceId: deviceId
      }
    },
    requestKeepAlive: {
      url: conf.txnGateway.keepAliveUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        deviceId: deviceId
      }
    }
  });
}

function _createWorkerAsValidator(conf, userAccount) {
  //Initialize worker
  let workerBlob = new Blob([_validatorWorker.validatorWorker.toString().replace(/^function .+\{?|\}$/g, '')], {
    type: 'text/javascript'
  });
  let workerBlobUrl = URL.createObjectURL(workerBlob);
  let worker = new Worker(workerBlobUrl);
  worker.postMessage({
    type: 'INIT_VALIDATOR',
    payload: {
      userAccount: userAccount,
      walletService: conf.wallet,
      txnGateway: conf.txnGateway
    }
  });
}

class UserDeviceRegistrar {
  constructor(conf, userAccount) {
    this._conf = conf;
    this._userAccount = userAccount;
  }

  register() {
    try {
      _registerToPusherBeams(this._conf, this._userAccount._uuid).then(deviceId => {
        _createWorkerForRegisterUserDevice(this._conf, this._userAccount, deviceId);

        _createWorkerAsValidator(this._conf, this._userAccount);
      }).catch(console.error);
    } catch (err) {
      console.error(err);
    }
  }

}

var _default = UserDeviceRegistrar;
exports.default = _default;