import libsodium from 'libsodium-wrappers';

let isReady = false;

const ready = (async () => {
    await libsodium.ready;
    isReady = true;
})();

export const generateKeyPair = async () => {
    if (!isReady) await ready;
    const keyPair = libsodium.crypto_box_keypair();
    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
    };
};

export const encryptMessage = async (
    message: string,
    myPrivateKey: Uint8Array,
    theirPublicKey: Uint8Array
): Promise<string> => {
    if (!isReady) await ready;

    const nonce = libsodium.randombytes_buf(libsodium.crypto_box_NONCEBYTES);
    const encryptedMessage = libsodium.crypto_box_easy(message, nonce, theirPublicKey, myPrivateKey);

    const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedMessage, nonce.length);

    return libsodium.to_base64(fullMessage);
};

export const decryptMessage = async (
    encryptedB64: string,
    myPrivateKey: Uint8Array,
    theirPublicKey: Uint8Array
): Promise<string> => {
    if (!isReady) await ready;

    const fullMessage = libsodium.from_base64(encryptedB64);
    const nonce = fullMessage.slice(0, libsodium.crypto_box_NONCEBYTES);
    const encrypted = fullMessage.slice(libsodium.crypto_box_NONCEBYTES);

    const decrypted = libsodium.crypto_box_open_easy(encrypted, nonce, theirPublicKey, myPrivateKey);

    return libsodium.to_string(decrypted);
};