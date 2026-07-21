import express from "express";
import passport from "passport";
import { body, validationResult } from "express-validator";

import {
  register,
  login,
  refresh,
  logout,
  googleSuccess,
  exchangeCode,
} from "../controllers/auth.controller.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Validation Middleware
|--------------------------------------------------------------------------
*/

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").escape(),
    body("email").trim().isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    validateRequest
  ],
  register
);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Must be a valid email").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
    validateRequest
  ],
  login
);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/exchange-code", exchangeCode);

/*
|--------------------------------------------------------------------------
| Google OAuth
|--------------------------------------------------------------------------
*/

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleSuccess
);

export default router;