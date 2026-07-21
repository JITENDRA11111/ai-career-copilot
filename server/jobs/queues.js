import Queue from "bull";

let redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

if (process.platform === "win32" && (redisUrl.includes("//redis:") || redisUrl.includes("@redis"))) {
  redisUrl = redisUrl.replace("//redis:", "//127.0.0.1:");
}

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

// Queue definitions
export const resumeParseQueue = new Queue("resumeParseQueue", redisUrl, {
  defaultJobOptions,
});

console.log("🚀 Bull Queues Initialized");
