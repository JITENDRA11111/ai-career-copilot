import SkillGap from "../../models/SkillGap.js";

/**
 * Save Skill Gap Analysis
 *
 * @param {Object} analysis
 * @returns {Object}
 */
export async function saveSkillGapAnalysis(analysis) {
  try {
    const existing = await SkillGap.findOne({
      userId: analysis.userId,
      resumeId: analysis.resumeId,
      targetRole: analysis.targetRole,
    });

    if (existing) {
      existing.currentSkills = analysis.currentSkills;
      existing.requiredSkills = analysis.requiredSkills;
      existing.missingSkills = analysis.missingSkills;
      existing.partialSkills = analysis.partialSkills;
      existing.learningPlan = analysis.learningPlan;
      existing.overallMatch = analysis.overallMatch;

      await existing.save();

      return existing;
    }

    const saved = await SkillGap.create({
      userId: analysis.userId,
      resumeId: analysis.resumeId,
      targetRole: analysis.targetRole,
      currentSkills: analysis.currentSkills,
      requiredSkills: analysis.requiredSkills,
      missingSkills: analysis.missingSkills,
      partialSkills: analysis.partialSkills,
      learningPlan: analysis.learningPlan,
      overallMatch: analysis.overallMatch,
    });

    return saved;

  } catch (error) {

    console.error(
      "Save Skill Gap Error:",
      error
    );

    throw error;
  }
}

/**
 * Get User Skill Gap History
 *
 * @param {String} userId
 * @returns {Array}
 */
export async function getSkillGapHistory(
  userId
) {
  try {

    const history =
      await SkillGap.find({
        userId,
      })
        .populate(
          "resumeId",
          "fileName uploadedAt"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return history;

  } catch (error) {

    console.error(
      "History Error:",
      error
    );

    throw error;
  }
}

/**
 * Get Skill Gap Analysis By ID
 *
 * @param {String} id
 * @param {String} userId
 */
export async function getSkillGapById(
  id,
  userId
) {
  try {

    const analysis =
      await SkillGap.findOne({
        _id: id,
        userId,
      }).populate(
        "resumeId",
        "fileName uploadedAt"
      );

    if (!analysis) {
      throw new Error(
        "Skill Gap Analysis not found."
      );
    }

    return analysis;

  } catch (error) {

    console.error(
      "Get Skill Gap Error:",
      error
    );

    throw error;
  }
}

/**
 * Delete Skill Gap Analysis
 *
 * @param {String} id
 * @param {String} userId
 */
export async function deleteSkillGap(
  id,
  userId
) {
  try {

    const deleted =
      await SkillGap.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!deleted) {
      throw new Error(
        "Skill Gap Analysis not found."
      );
    }

    return deleted;

  } catch (error) {

    console.error(
      "Delete Skill Gap Error:",
      error
    );

    throw error;
  }
}

/**
 * Get Latest Skill Gap Analysis
 *
 * Useful for dashboard widgets
 */
export async function getLatestSkillGap(
  userId
) {
  try {

    return await SkillGap.findOne({
      userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  } catch (error) {

    console.error(
      "Latest Skill Gap Error:",
      error
    );

    throw error;
  }
}