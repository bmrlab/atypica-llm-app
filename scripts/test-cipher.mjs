import crypto from "crypto";
import { dirname } from "path";
import { fileURLToPath } from "url";

// 获取 __dirname (在 ESM 中需要特殊处理)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function encodeAnalystId(id) {
  const IV_LENGTH = 16;
  const ALGORITHM = "aes-256-cbc";
  // const CIPHER_SECRET_KEY = process.env.CIPHER_SECRET_KEY;
  const CIPHER_SECRET_KEY = crypto.scryptSync(process.env.CIPHER_SECRET_KEY, "salt", 32);
  if (!CIPHER_SECRET_KEY) {
    throw new Error("CIPHER_SECRET_KEY environment variable is not set");
  }
  // Convert ID to buffer
  const idBuffer = Buffer.from(id.toString(), "utf-8");
  // Create initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, CIPHER_SECRET_KEY, iv);
  // Encrypt the ID
  let encrypted = cipher.update(id.toString(), "utf8", "base64");
  encrypted += cipher.final("base64");
  // 将IV和加密数据合并成一个字符串
  // 前16字节是IV，后面是加密数据
  const result = Buffer.concat([iv, Buffer.from(encrypted, "base64")]);
  // 返回Base64编码的结果
  return result.toString("base64");
}

// Convert token back to analyst ID
function decodeAnalystToken(encryptedText) {
  const IV_LENGTH = 16;
  const ALGORITHM = "aes-256-cbc";
  // const CIPHER_SECRET_KEY = process.env.CIPHER_SECRET_KEY;
  const CIPHER_SECRET_KEY = crypto.scryptSync(process.env.CIPHER_SECRET_KEY, "salt", 32);
  if (!CIPHER_SECRET_KEY) {
    throw new Error("CIPHER_SECRET_KEY environment variable is not set");
  }
  // 将Base64字符串转换回Buffer
  const buffer = Buffer.from(encryptedText, "base64");
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
  return parseInt(decrypted);
}

function main() {
  const encrypted = encodeAnalystId(123456);
  console.log(encrypted);
  const decrypted = decodeAnalystToken(encrypted);
  console.log(decrypted);
}
main();
