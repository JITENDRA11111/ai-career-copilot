import jwt from "jsonwebtoken";

import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Authorization:", req.headers.authorization);

    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id).select("-passwordHash");

    console.log("User:", user);

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: "User account has been deactivated or not found.",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.log(err);   // <-- IMPORTANT
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;