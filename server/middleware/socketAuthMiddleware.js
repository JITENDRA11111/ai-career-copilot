import jwt from "jsonwebtoken";
import User from "../models/User.js";

const socketAuthMiddleware = async (socket, next) => {
  console.log("=== socketAuthMiddleware ===");
  console.log("Handshake auth:", socket.handshake.auth);
  
  try {
    let token = socket.handshake.auth?.token;

    // Fallback 1: Query parameter (?token=...)
    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token;
    }

    // Fallback 2: Custom header (token: ...)
    if (!token && socket.handshake.headers?.token) {
      token = socket.handshake.headers.token;
    }

    // Fallback 3: Authorization header (Authorization: Bearer ...)
    if (!token && socket.handshake.headers?.authorization) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    if (!token) {
      console.log("Socket Auth Error: Token not provided");
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      console.log(`Socket Auth Error: User with ID ${decoded.id} not found`);
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Exception:", err.message);
    next(new Error("Unauthorized"));
  }
};

export default socketAuthMiddleware;
