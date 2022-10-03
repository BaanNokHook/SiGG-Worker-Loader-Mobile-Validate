export const TxnValidatorConf = {
    env: {
        dev: {
            wallet: {
                getPubKeyUrl: 'http://localhost:5000/wallets/masque/publicKey',
                generateSignatureUrl: 'http://localhost:5000/wallets/sign'
            },
            beams: {
                instanceId: 'ed6e47de-ab49-489a-8982-eeec598b2b8b',
                authUrl: 'http://localhost:5000/pusher/beams-auth'
            },
            txnGateway: {
                registerDeviceUrl: 'http://localhost:5000/devices',
                keepAliveUrl: 'http://localhost:5000/devices/{deviceId}/status',
                queryTxn: 'http://localhost:5000/queryTxn',
                submitValidatedTxnUrl: 'http://localhost:5000/submitValidatedTxn'
            }
        },
        test: {
            wallet: {
                getPubKeyUrl: 'https://wallet-dev.adldigitalservice.com/api/v1/wallets/getPublickey',
                generateSignatureUrl: 'https://wallet-dev.adldigitalservice.com/api/v1/wallets/sign',

            },
            beams: {
                instanceId: 'eb3d4c21-3ff6-4378-8117-f0acf095d6b3',
                authUrl: 'https://wallet-dev.adldigitalservice.com/api/v1/devices/auth'
            },
            txnGateway: {
                registerDeviceUrl: 'https://wallet-dev.adldigitalservice.com/api/v1/devices/',
                keepAliveUrl: 'https://wallet-dev.adldigitalservice.com/api/v1/devices/{deviceId}/status',
                queryTxn: 'https://wallet-dev.adldigitalservice.com/rpc/transaction-query',
                submitValidatedTxnUrl: 'https://wallet-dev.adldigitalservice.com/rpc/transaction-gateway'
            }
        },
        prod: {
            wallet: {
                getPubKeyUrl: '',
                generateSignatureUrl:''
            },
            beams: {
                instanceId: 'eb3d4c21-3ff6-4378-8117-f0acf095d6b3',
                authUrl: ''
            },
            txnGateway: {
                registerDeviceUrl: '',
                keepAliveUrl:'',
                queryTxn: '',
                submitValidatedTxnUrl: ''
            }
        }
    }
};