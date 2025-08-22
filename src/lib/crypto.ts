
const ALGORITHM = 'ECDH';
const CURVE = 'P-256';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const ENCRYPTION_LENGTH = 256;

export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: ALGORITHM,
            namedCurve: CURVE,
        },
        false, // Chave não é extraível!
        ['deriveKey']
    );
    return keyPair;
};

export const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

const importPublicKey = async (publicKeyB64: string): Promise<CryptoKey> => {
    const binaryDer = new Uint8Array(atob(publicKeyB64).split('').map(c => c.charCodeAt(0)));
    return window.crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: ALGORITHM,
            namedCurve: CURVE,
        },
        true,
        []
    );
};

export const encryptMessage = async (
    message: string,
    privateKey: CryptoKey,
    theirPublicKeyB64: string
): Promise<string> => {
    const theirPublicKey = await importPublicKey(theirPublicKeyB64);
    const sharedSecret = await window.crypto.subtle.deriveKey(
        {
            name: ALGORITHM,
            public: theirPublicKey,
        },
        privateKey,
        {
            name: ENCRYPTION_ALGORITHM,
            length: ENCRYPTION_LENGTH,
        },
        false,
        ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedMessage = new TextEncoder().encode(message);
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: ENCRYPTION_ALGORITHM,
            iv: iv,
        },
        sharedSecret,
        encodedMessage
    );

    const fullMessage = new Uint8Array(iv.length + encryptedContent.byteLength);
    fullMessage.set(iv);
    fullMessage.set(new Uint8Array(encryptedContent), iv.length);

    return btoa(String.fromCharCode(...fullMessage));
};

export const decryptMessage = async (
    encryptedB64: string,
    privateKey: CryptoKey,
    theirPublicKeyB64: string
): Promise<string> => {
    const theirPublicKey = await importPublicKey(theirPublicKeyB64);
    const sharedSecret = await window.crypto.subtle.deriveKey(
        {
            name: ALGORITHM,
            public: theirPublicKey,
        },
        privateKey,
        {
            name: ENCRYPTION_ALGORITHM,
            length: ENCRYPTION_LENGTH,
        },
        false,
        ['decrypt']
    );

    const fullMessage = new Uint8Array(atob(encryptedB64).split('').map(c => c.charCodeAt(0)));
    const iv = fullMessage.slice(0, 12);
    const encryptedContent = fullMessage.slice(12);
    const decryptedContent = await window.crypto.subtle.decrypt(
        {
            name: ENCRYPTION_ALGORITHM,
            iv: iv,
        },
        sharedSecret,
        encryptedContent
    );
    return new TextDecoder().decode(decryptedContent);
};