import crypto from "crypto";

const CODE_TTL = 60 * 1000; // 60 seconds

const oauthCodes = new Map();

export const generateOAuthCode = async (userId) => {
  const code = crypto.randomBytes(32).toString("hex");

  oauthCodes.set(code, {
    userId: userId.toString(),
    expiresAt: Date.now() + CODE_TTL,
  });

  return code;
};

export const consumeOAuthCode = async (code) => {
  const data = oauthCodes.get(code);

  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    oauthCodes.delete(code);
    return null;
  }

  oauthCodes.delete(code);

  return data.userId;
};