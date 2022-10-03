"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validatorWorker = validatorWorker;

/* //-disable no-unused-vars */
function validatorWorker() {
  let userAccount;
  let txnGatewayEndpoints;
  let walletService;
  self.addEventListener('message', e => {
    if (e.data && e.data.type === 'INIT_VALIDATOR') {
      userAccount = e.data.payload.userAccount;
      txnGatewayEndpoints = e.data.payload.txnGateway;
      walletService = e.data.payload.walletService;
    }
  });
  const broadcast = new BroadcastChannel('txn-validator');

  broadcast.onmessage = e => {
    if (e.data && e.data.type === 'VALIDATE_TXN') {
      //Must providing by Client
      let queryUrl = txnGatewayEndpoints.queryTxn,
          generateSignatureUrl = walletService.generateSignatureUrl,
          submitValidatedTxnUrl = txnGatewayEndpoints.submitValidatedTxnUrl;
      let userId = userAccount._uuid,
          address = userAccount._accountAddress,
          encryptedMnemonicPhrased = userAccount._encryptedMnemonicPhrase; // Handle Transaction Notification //

      try {
        if (!e.data.payload || e.data.payload.txnId == undefined) {
          throw new Error('txnid is undefined');
        }

        let txnId = e.data.payload.txnId;
        let txnEncodeData;
        let signature; //1. Query Transaction Data by Transaction ID

        let queryTxnIdResp = fetch(queryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8'
          },
          // body: JSON.stringify(user)
          body: JSON.stringify({
            id: Date.now() + "",
            jsonrpc: '2.0',
            method: 'getunverifytx',
            params: [txnId]
          })
        }).then(response => response.json()).then(data => {
          txnEncodeData = data.result.txnEncodeData;
          console.log('Raw Txn Data :' + txnEncodeData);

          if (txnEncodeData != undefined) {
            fetch(generateSignatureUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json;charset=utf-8'
              },
              // body: JSON.stringify(user)
              body: JSON.stringify({
                userUniqueId: userId,
                encryptMnemonic: encryptedMnemonicPhrased,
                accountAddress: address,
                message: txnEncodeData
              })
            }).then(response => response.json()).then(data => {
              signature = data.signature;
              console.log('Signature :' + signature); //4. Submit validated transaction

              if (signature) {
                fetch(submitValidatedTxnUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  // body: JSON.stringify(user)
                  body: JSON.stringify({
                    id: Date.now() + "",
                    jsonrpc: '2.0',
                    method: 'sendvalidatedrawtransaction',
                    params: [txnId, signature]
                  })
                }).then(response => response.json()).then(data => {
                  console.log('Txn submitted :' + JSON.stringify);
                });
              }
            });
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };
}