import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async (userId, action, details, req = null) => {
  try {
    const logData = {
      userId,
      action,
      details,
    };

    if (req) {
      logData.ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      logData.userAgent = req.headers["user-agent"];
    }

    await ActivityLog.create(logData);
  } catch (error) {
    console.error("Activity Logging Error:", error);
  }
};
