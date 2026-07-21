import bcrypt from "bcryptjs";

import User from "../models/User.js";

import {
  consumeOAuthCode,
  generateOAuthCode,
} from "../utils/oauthCode.js";

import {
  issueTokens,
  createAuthResponse,
  setRefreshCookie,
  clearRefreshCookie,
} from "../utils/authHelpers.js";



import { verifyRefreshToken } from "../utils/jwt.js";
import { cache } from "../config/redis.js";





/**
 * ------------------------------------------------------------------
 * Register User
 * POST /api/auth/register
 * ------------------------------------------------------------------
 */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Generate access + refresh tokens
    const {
      accessToken,
      refreshToken,
    } = await issueTokens(user);

    // Store refresh token in secure cookie
    setRefreshCookie(res, refreshToken);

    return res.status(201).json(
      createAuthResponse(
        user,
        accessToken,
        process.env.NODE_ENV === "production"
          ? undefined
          : refreshToken,
        "Registration successful"
      )
    );
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * ------------------------------------------------------------------
 * Login User
 * POST /api/auth/login
 * ------------------------------------------------------------------
 */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // -------------------------------
    // Validate Request
    // -------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -------------------------------
    // Find User
    // -------------------------------
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -------------------------------
    // Password Login Only
    // -------------------------------
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    // -------------------------------
    // Verify Password
    // -------------------------------
    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // -------------------------------
    // Issue New Tokens
    // -------------------------------
    const {
      accessToken,
      refreshToken,
    } = await issueTokens(user);

    // -------------------------------
    // Store Refresh Token in Cookie
    // -------------------------------
    setRefreshCookie(res, refreshToken);

    // -------------------------------
    // Response
    // -------------------------------
    return res.status(200).json(
      createAuthResponse(
        user,
        accessToken,
        process.env.NODE_ENV === "production"
          ? undefined
          : refreshToken,
        "Login successful"
      )
    );
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * ------------------------------------------------------------------
 * Refresh Access Token (Token Rotation)
 * POST /api/auth/refresh
 * ------------------------------------------------------------------
 */

export const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await cache.get(`blacklist:token:${refreshToken}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await issueTokens(user);

    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json(
      createAuthResponse(
        user,
        accessToken,
        process.env.NODE_ENV === "production"
          ? undefined
          : newRefreshToken,
        "Token refreshed successfully"
      )
    );
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

/**
 * ---------------------------------------------------------
 * Logout User
 * POST /api/auth/logout
 * ---------------------------------------------------------
 */

export const logout = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        const remainingTime = payload.exp - Math.floor(Date.now() / 1000);
        if (remainingTime > 0) {
          // Store token in Redis blacklist
          await cache.set(`blacklist:token:${refreshToken}`, "true", remainingTime);
        }
      } catch (err) {
        // Token is already invalid or expired, ignore
      }
    }

    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * ---------------------------------------------------------
 * Google OAuth Success
 * GET /api/auth/google/callback
 * ---------------------------------------------------------
 */



export const googleSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login`
      );
    }

    const code = await generateOAuthCode(
      req.user._id
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?code=${code}`
    );
  } catch (err) {
    console.error(err);

    return res.redirect(
      `${process.env.CLIENT_URL}/login`
    );
  }
};


export const exchangeCode = async (
  req,
  res
) => {

  try {
    const { code } = req.body;

  const userId =
    await consumeOAuthCode(code);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Invalid code",
    });
  }

  const user =
    await User.findById(userId);

  if (!user) {
    return res.status(404).json({
        success:false,
        message:"User not found"
    });
  }

  const {
    accessToken,
    refreshToken,
  } =
    await issueTokens(user);

  setRefreshCookie(
    res,
    refreshToken
  );

  return res.json(
    createAuthResponse(
      user,
      accessToken,
      undefined,
      "Google login successful"
    )
  );
  } catch (err) {

      console.error(err);

      return res.redirect(
        `${process.env.CLIENT_URL}/login`
      );

  }

};