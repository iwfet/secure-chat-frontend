
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
        false,
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


export const generateSafetyNumber = async (myPublicKey: CryptoKey, theirPublicKeyB64: string): Promise<string> => {
    const theirPublicKey = await importPublicKey(theirPublicKeyB64);

    const myExported = await window.crypto.subtle.exportKey('spki', myPublicKey);
    const theirExported = await window.crypto.subtle.exportKey('spki', theirPublicKey);

    const myExportedBytes = new Uint8Array(myExported);
    const theirExportedBytes = new Uint8Array(theirExported);

    const combined = new Uint8Array(myExportedBytes.length + theirExportedBytes.length);
    if (btoa(String.fromCharCode(...myExportedBytes)) < btoa(String.fromCharCode(...theirExportedBytes))) {
        combined.set(myExportedBytes);
        combined.set(theirExportedBytes, myExportedBytes.length);
    } else {
        combined.set(theirExportedBytes);
        combined.set(myExportedBytes, theirExportedBytes.length);
    }

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(b => b.toString().padStart(3, '0'))
        .join('')
        .substring(0, 30) // Pega os primeiros 30 dígitos
        .replace(/(\d{5})/g, '$1 ') // Adiciona um espaço a cada 5 dígitos
        .trim();
};