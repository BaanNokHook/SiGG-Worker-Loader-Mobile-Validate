"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserAccount = void 0;

class UserAccount {
  constructor(uuid, accountAddress, encryptedMnemonicPhrase) {
    this._uuid = uuid;
    this._accountAddress = accountAddress;
    this._encryptedMnemonicPhrase = encryptedMnemonicPhrase;
  }

}

exports.UserAccount = UserAccount;