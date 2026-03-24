import { encrypt, decrypt } from '../../../shared/utils/encryption';

describe('Encryption Utility', () => {
  it('should encrypt and decrypt a plaintext string correctly', () => {
    const originalText = '12345678901';
    
    // Test encryption
    const encrypted = encrypt(originalText);
    expect(encrypted).not.toBe(originalText);
    expect(encrypted).toContain(':'); // IV and cipher text split

    // Test decryption
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it('should return original text if it was not encrypted for backward compatibility', () => {
    const legacyPlaintext = 'plain_text_no_iv';
    const result = decrypt(legacyPlaintext);
    expect(result).toBe(legacyPlaintext);
  });
});
