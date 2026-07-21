import {
  generateAccessToken,
  generateRefreshToken,
} from "./jwt.js";

/* -------------------------------------------------------------------------- */
/* Sanitize User Object */
/* -------------------------------------------------------------------------- */

export const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
});

/* -------------------------------------------------------------------------- */
/* Generate Access + Refresh Tokens */
/* -------------------------------------------------------------------------- */

export const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
};

/* -------------------------------------------------------------------------- */
/* Issue Tokens */
/* -------------------------------------------------------------------------- */
/**
 * Since Redis has been removed, we simply generate
 * and return the tokens.
 *
 * Later when Redis is added back, this is the only
 * function that needs to change.
 */

export const issueTokens = async (user) => {
  return generateTokens(user);
};

/* -------------------------------------------------------------------------- */
/* Auth Response */
/* -------------------------------------------------------------------------- */

export const createAuthResponse = (
  user,
  accessToken,
  refreshToken,
  message
) => ({
  success: true,
  message,
  accessToken,

  // Hide refresh token in production
  ...(refreshToken && {
    refreshToken,
  }),

  user: sanitizeUser(user),
});

/* -------------------------------------------------------------------------- */
/* Cookie Options */
/* -------------------------------------------------------------------------- */

export const getRefreshCookieOptions = () => ({
  httpOnly: true,

  secure: process.env.NODE_ENV === "production",

  sameSite:
    process.env.NODE_ENV === "production"
      ? "None"
      : "Lax",

  maxAge: 7 * 24 * 60 * 60 * 1000,

  path: "/",
});

/* -------------------------------------------------------------------------- */
/* Set Refresh Cookie */
/* -------------------------------------------------------------------------- */

export const setRefreshCookie = (
  res,
  refreshToken
) => {
  res.cookie(
    "refreshToken",
    refreshToken,
    getRefreshCookieOptions()
  );
};

/* -------------------------------------------------------------------------- */
/* Clear Refresh Cookie */
/* -------------------------------------------------------------------------- */

export const clearRefreshCookie = (res) => {
  res.clearCookie(
    "refreshToken",
    getRefreshCookieOptions()
  );
};