import Redis from "ioredis";

let redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// If running on Windows and REDIS_URL points to docker service name 'redis', fallback to localhost
if (process.platform === "win32" && (redisUrl.includes("//redis:") || redisUrl.includes("@redis"))) {
  redisUrl = redisUrl.replace("//redis:", "//127.0.0.1:");
}

let redis = null;
let useLocalCache = false;
const localCache = new Map();

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy(times) {
      if (times >= 2) {
        useLocalCache = true;
        console.warn("⚠️ Redis connection failed. Falling back to in-memory cache.");
        return null; // stop retrying
      }
      return 1000;
    }
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err.message);
    useLocalCache = true;
  });
  
  redis.on("connect", () => {
    console.log("🚀 Connected to Redis successfully");
    useLocalCache = false;
  });
} catch (error) {
  console.error("Failed to initialize Redis client:", error.message);
  useLocalCache = true;
}

export const cache = {
  async get(key) {
    if (useLocalCache || !redis) {
      return localCache.get(key) || null;
    }
    try {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error("Redis GET error, falling back to local cache:", err.message);
      useLocalCache = true;
      return localCache.get(key) || null;
    }
  },

  async set(key, value, ttlSeconds = 86400) {
    if (useLocalCache || !redis) {
      localCache.set(key, value);
      return true;
    }
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return true;
    } catch (err) {
      console.error("Redis SET error, falling back to local cache:", err.message);
      useLocalCache = true;
      localCache.set(key, value);
      return true;
    }
  },

  async del(key) {
    localCache.delete(key);
    if (useLocalCache || !redis) {
      return true;
    }
    try {
      await redis.del(key);
      return true;
    } catch (err) {
      console.error("Redis DEL error:", err.message);
      return true;
    }
  }
};

export default redis;
