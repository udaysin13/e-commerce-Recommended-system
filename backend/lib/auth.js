const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-only-jwt-secret-change-me";
}

function signJwt(payload, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + (options.expiresInSeconds || TOKEN_TTL_SECONDS),
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token) {
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");
  const receivedSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    receivedSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer)
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;

  if (!storedPassword.startsWith("scrypt$")) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split("$");
  const hash = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");

  return stored.length === hash.length && crypto.timingSafeEqual(stored, hash);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

module.exports = {
  hashPassword,
  sanitizeUser,
  signJwt,
  verifyJwt,
  verifyPassword,
};
