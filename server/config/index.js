export const validateEnv = () => {
  const requiredEnvVars = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "REDIS_URL",
    "CLIENT_URL",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Startup Error: Missing required environment variables: ${missingVars.join(
        ", "
      )}`
    );
  }

  console.log("✅ Environment validation passed.");
};
