// app/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-char-secret-key-here".padEnd(32);
const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

export function decrypt(encryptedData: string, iv: string): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
}
