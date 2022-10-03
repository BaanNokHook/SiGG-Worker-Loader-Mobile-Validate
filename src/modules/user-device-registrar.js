import * as PusherPushNotifications from '@pusher/push-notifications-web';
import { registrarWorker } from './registrar-worker';
import { validatorWorker } from './validator-worker';

async function _registerToPusherBeams(conf, uuid) {
  //Registering a service worker
  let promise = new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('service-worker.js')
        .then(function () {
          console.log('I-Service Worker Registered');
          const beamsClient = new PusherPushNotifications.Client({
            instanceId: conf.beams.instanceId,
          });

          beamsClient
            .getUserId()
            .then((userId) => {
              // Check if the Beams user matches the user that is currently logged in
              if (userId !== uuid) {
                // Unregister for notifications
                return beamsClient.stop();
              }
            }).catch((error) => {
              throw error;
            });

          const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
            url: conf.beams.authUrl,
          });

          let _deviceId;
          beamsClient.start()
            .then((beamsClient) => beamsClient.getDeviceId())
            .then((deviceId) => {
              _deviceId = deviceId;
              console.log('II-Successfully registered with Beams. Device ID:' + deviceId);
            })
            .then(() => {
              beamsClient.setUserId(uuid, beamsTokenProvider)
                .then(() => {
                  console.log('User ID has been set');
                  resolve(_deviceId);
                })
                .catch((e) => {
                  reject(new Error('Could not authenticate with Beams:' + e));
                });
            })
            .catch((e) => {
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
  let workerBlob = new Blob(
    [registrarWorker.toString().replace(/^function .+\{?|\}$/g, '')],
    { type: 'text/javascript' }
  );
  let workerBlobUrl = URL.createObjectURL(workerBlob);
  let worker = new Worker(workerBlobUrl);
  worker.postMessage({
    requestPubKey: {
      url: conf.wallet.getPubKeyUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        userUniqueId: userAccount._uuid,
        encryptMnemonic: userAccount._encryptedMnemonicPhrase,
        accountAddress: userAccount._accountAddress
      },
    },
    requestRegister: {
      url: conf.txnGateway.registerDeviceUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        UserId: userAccount._uuid,
        DeviceId: deviceId
      },
    },
    requestKeepAlive: {
      url: conf.txnGateway.keepAliveUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        deviceId: deviceId
      },
    }
  });
}

function _createWorkerAsValidator(conf, userAccount) {
  //Initialize worker
  let workerBlob = new Blob(
    [validatorWorker.toString().replace(/^function .+\{?|\}$/g, '')],
    { type: 'text/javascript' }
  );
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
      _registerToPusherBeams(this._conf, this._userAccount._uuid)
        .then((deviceId) => {
          _createWorkerForRegisterUserDevice(this._conf, this._userAccount, deviceId);
          _createWorkerAsValidator(this._conf, this._userAccount);
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  }
}

export default UserDeviceRegistrar;