import libsodium from 'libsodium-wrappers';

let isReady = false;

// Inicializa o libsodium
const ready = (async () => {
    await libsodium.ready;
    isReady = true;
})();

// Função para gerar um novo par de chaves
export const generateKeyPair = async () => {
    if (!isReady) await ready;
    const keyPair = libsodium.crypto_box_keypair();
    return {
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
    };
};

/**
 * Criptografa uma mensagem usando a chave privada do remetente e a chave pública do destinatário.
 * @param message A mensagem em texto plano.
 * @param myPrivateKey A chave privada do utilizador que está a enviar.
 * @param theirPublicKey A chave pública do destinatário (recebida via WebSocket).
 * @returns A mensagem criptografada como uma string Base64.
 */
export const encryptMessage = async (
    message: string,
    myPrivateKey: Uint8Array,
    theirPublicKey: Uint8Array
): Promise<string> => {
    if (!isReady) await ready;

    // Um nonce é um número único para cada mensagem para prevenir ataques de repetição.
    const nonce = libsodium.randombytes_buf(libsodium.crypto_box_NONCEBYTES);
    const encryptedMessage = libsodium.crypto_box_easy(message, nonce, theirPublicKey, myPrivateKey);

    // Combina o nonce e a mensagem criptografada para envio. O nonce é necessário para descriptografar.
    const fullMessage = new Uint8Array(nonce.length + encryptedMessage.length);
    fullMessage.set(nonce);
    fullMessage.set(encryptedMessage, nonce.length);

    // Converte para Base64 para ser enviado como string via JSON/Socket.IO.
    return libsodium.to_base64(fullMessage);
};

/**
 * Descriptografa uma mensagem.
 * @param encryptedB64 A mensagem completa (nonce + conteúdo) em Base64.
 * @param myPrivateKey A chave privada do utilizador que está a receber.
 * @param theirPublicKey A chave pública do remetente.
 * @returns A mensagem original em texto plano.
 */
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

    // Converte o resultado de volta para uma string legível.
    return libsodium.to_string(decrypted);
};