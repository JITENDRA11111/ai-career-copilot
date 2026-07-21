import JobRecommendationCache from "../../models/JobRecommendationCache.js";

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Get Cached Job Recommendations
 *
 * @param {String} userId
 * @param {String} resumeId
 * @returns {Array|null}
 */
export async function getCachedRecommendations(
  userId,
  resumeId
) {
  try {
    const cache =
      await JobRecommendationCache.findOne({
        userId,
        resumeId,
      });

    if (!cache) {
      return null;
    }

    // Extra safety check
    if (cache.expiresAt <= new Date()) {
      await JobRecommendationCache.deleteOne({
        _id: cache._id,
      });

      return null;
    }

    return cache.jobs;

  } catch (error) {

    console.error(
      "Cache Read Error:",
      error.message
    );

    return null;
  }
}

/**
 * Save Job Recommendations to Cache
 *
 * @param {String} userId
 * @param {String} resumeId
 * @param {Array} jobs
 * @returns {Array}
 */
export async function saveRecommendationsCache(
  userId,
  resumeId,
  jobs
) {
  try {

    const expiresAt = new Date(
      Date.now() + CACHE_DURATION
    );

    await JobRecommendationCache.findOneAndUpdate(
      {
        userId,
        resumeId,
      },
      {
        $set: {
          jobs,
          expiresAt,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return jobs;

  } catch (error) {

    console.error(
      "Cache Save Error:",
      error.message
    );

    return jobs;
  }
}

/**
 * Clear Recommendation Cache
 *
 * Useful when user uploads a new resume.
 */
export async function clearRecommendationCache(
  userId,
  resumeId
) {
  try {

    await JobRecommendationCache.deleteOne({
      userId,
      resumeId,
    });

  } catch (error) {

    console.error(
      "Cache Delete Error:",
      error.message
    );
  }
}

/**
 * Remove All Cached Recommendations
 * (Optional utility)
 */
export async function clearAllRecommendationCache(
  userId
) {
  try {

    await JobRecommendationCache.deleteMany({
      userId,
    });

  } catch (error) {

    console.error(
      "Cache Clear Error:",
      error.message
    );
  }
}