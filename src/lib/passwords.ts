import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const separator = ":";

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}${separator}${hash}`;
};

export const verifyPassword = (password: string, storedPassword: string) => {
  const [salt, storedHash] = storedPassword.split(separator);
  if (!salt || !storedHash) return false;

  const derivedHash = scryptSync(password, salt, 64);
  const expectedHash = Buffer.from(storedHash, "hex");
  return expectedHash.length === derivedHash.length && timingSafeEqual(expectedHash, derivedHash);
};
