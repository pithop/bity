import { generateKeyPairSync, sign, verify, createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { app } from 'electron';

// In a real production environment, these keys should be stored in a secure enclave or HSM.
// For this implementation, we store them in the user's data directory.
const KEYS_DIR = path.join(app.getPath('userData'), 'security');
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public.pem');

export class CryptoService {
    private privateKey: string;
    private publicKey: string;

    constructor() {
        this.ensureKeysExist();
        this.privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
        this.publicKey = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');
    }

    private ensureKeysExist() {
        if (!fs.existsSync(KEYS_DIR)) {
            fs.mkdirSync(KEYS_DIR, { recursive: true });
        }

        if (!fs.existsSync(PRIVATE_KEY_PATH) || !fs.existsSync(PUBLIC_KEY_PATH)) {
            const { privateKey, publicKey } = generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                },
            });

            fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
            fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
        }
    }

    /**
     * Canonicalizes a transaction object to ensure consistent signing.
     * Concatenates critical fields in a deterministic order.
     */
    public canonicalize(data: Record<string, any>): string {
        // Sort keys to ensure deterministic order
        const sortedKeys = Object.keys(data).sort();
        const parts: string[] = [];

        for (const key of sortedKeys) {
            const value = data[key];
            if (value === null || value === undefined) {
                parts.push(`${key}:`);
            } else if (typeof value === 'object') {
                parts.push(`${key}:${JSON.stringify(value)}`);
            } else {
                parts.push(`${key}:${String(value)}`);
            }
        }

        return parts.join('|');
    }

    /**
     * Signs a data payload combined with the previous signature hash.
     * @param data The current transaction data
     * @param previousSignature The signature of the previous transaction (for chaining)
     */
    public signTransaction(data: Record<string, any>, previousSignature: string): string {
        const canonicalData = this.canonicalize(data);

        // Hash the previous signature to include in the chain
        const prevHash = createHash('sha256').update(previousSignature).digest('hex');

        // The payload to sign is the canonical data + the hash of the previous signature
        const payloadToSign = `${canonicalData}|PREV_HASH:${prevHash}`;

        const signature = sign('sha256', Buffer.from(payloadToSign), {
            key: this.privateKey,
            padding: 1 // crypto.constants.RSA_PKCS1_PADDING
        });

        return signature.toString('base64');
    }

    public verifyTransaction(data: Record<string, any>, previousSignature: string, signature: string): boolean {
        const canonicalData = this.canonicalize(data);
        const prevHash = createHash('sha256').update(previousSignature).digest('hex');
        const payloadToVerify = `${canonicalData}|PREV_HASH:${prevHash}`;

        return verify(
            'sha256',
            Buffer.from(payloadToVerify),
            {
                key: this.publicKey,
                padding: 1
            },
            Buffer.from(signature, 'base64')
        );
    }

    public getPublicKey(): string {
        return this.publicKey;
    }

    /**
     * Generates a SHA-256 hash of the input string.
     */
    public hash(data: string): string {
        return createHash('sha256').update(data).digest('hex');
    }

    /**
     * Signs a string payload using the private key (RSA-SHA256).
     */
    public sign(data: string): string {
        const signature = sign('sha256', Buffer.from(data), {
            key: this.privateKey,
            padding: 1 // crypto.constants.RSA_PKCS1_PADDING
        });
        return signature.toString('base64');
    }
}

export const cryptoService = new CryptoService();
