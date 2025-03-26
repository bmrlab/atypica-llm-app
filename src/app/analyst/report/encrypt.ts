"use server";
import crypto from "crypto";

export async function encryptAnalystReportUrl(id: number) {
  const encoded = encryptText(id.toString());
  return `/analyst/report/${encodeURIComponent(encoded)}`;
}

export async function decryptAnalystId(token: string) {
  const decoded = decryptText(token);
  return parseInt(decoded);
}

function encryptText(text: string): string {
  const IV_LENGTH = 16;
  const ALGORITHM = "aes-256-cbc";
  const CIPHER_PASSWORD = process.env.CIPHER_PASSWORD;
  if (!CIPHER_PASSWORD) {
    throw new Error("CIPHER_SECRET_KEY environment variable is not set");
  }
  const CIPHER_SECRET_KEY = crypto.scryptSync(CIPHER_PASSWORD, "salt", 32);
  // Create initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, CIPHER_SECRET_KEY, iv);
  // Encrypt the ID
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  // 将IV和加密数据合并成一个字符串
  // 前16字节是IV，后面是加密数据
  const result = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
  // 返回Base64编码的结果
  return result
    .toString("base64")
    .replace(/\+/g, "-") // remove +
    .replace(/\//g, "_") // remove /
    .replace(/=/g, ""); // remove padding =
}

// Convert token back to analyst ID
function decryptText(encryptedText: string): string {
  const IV_LENGTH = 16;
  const ALGORITHM = "aes-256-cbc";
  const CIPHER_PASSWORD = process.env.CIPHER_PASSWORD;
  if (!CIPHER_PASSWORD) {
    throw new Error("CIPHER_SECRET_KEY environment variable is not set");
  }
  const CIPHER_SECRET_KEY = crypto.scryptSync(CIPHER_PASSWORD, "salt", 32);
  // Restore base64 standard characters and padding
  let normalizedText = encryptedText.replace(/-/g, "+").replace(/_/g, "/");
  // Add back padding if needed
  while (normalizedText.length % 4) {
    normalizedText += "=";
  }
  // 将Base64字符串转换回Buffer
  const buffer = Buffer.from(normalizedText, "base64");
  // 提取IV(前16字节)
  const iv = buffer.subarray(0, IV_LENGTH);
  // 提取加密数据(剩余部分)
  const encrypted = buffer.subarray(IV_LENGTH).toString("base64");
  // 创建解密器
  const decipher = crypto.createDecipheriv(ALGORITHM, CIPHER_SECRET_KEY, iv);
  // 解密数据
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  decrypted += decipher.final("utf8");
  // 将解密后的字符串转换为数字
  return decrypted;
}
