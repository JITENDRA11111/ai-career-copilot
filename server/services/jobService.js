import { recommendJobs } from "./jobRecommendation/recommendationService.js";

import {
  saveJob,
  getSavedJobs,
  deleteSavedJob,
  isJobSaved,
} from "./jobRecommendation/savedJobService.js";

export {
  recommendJobs,
  saveJob,
  getSavedJobs,
  deleteSavedJob,
  isJobSaved,
};