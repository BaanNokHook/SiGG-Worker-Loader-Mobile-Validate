export class UserAccount {
    constructor (uuid, accountAddress, encryptedMnemonicPhrase) {
        this._uuid = uuid;
        this._accountAddress = accountAddress;
        this._encryptedMnemonicPhrase = encryptedMnemonicPhrase;
    }
}