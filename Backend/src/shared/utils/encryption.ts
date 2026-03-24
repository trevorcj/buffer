import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure a 32 byte key. In hackathon/prototype, fallback to a default if env is missing exactly 32 bytes
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 32
  ? process.env.ENCRYPTION_KEY
  : 'default_secret_key_needs_32bytes'; // exactly 32 chars

const IV_LENGTH = 16;

/**
 * Encrypt a plain text string using AES-256-CBC
 */
export function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt an AES-256-CBC encrypted string
 */
export function decrypt(text: string): string | null {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) return text; // Not encrypted, might be legacy plain text
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // If decryption fails, maybe it was legacy plain text, return as is.
    return text;
  }
}
