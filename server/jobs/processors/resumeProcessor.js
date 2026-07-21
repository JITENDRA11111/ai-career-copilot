import { resumeParseQueue } from "../queues.js";
import Resume from "../../models/resume.model.js";
import { parseResume } from "../../services/resumeParserService.js";

resumeParseQueue.process(async (job, done) => {
  try {
    const { resumeId, fileUrl, fileName, userEmail, userName } = job.data;
    
    console.log(`[Bull] Starting resume parse job for ${resumeId}`);
    
    // Perform AI Parsing
    const parsedData = await parseResume(fileUrl, fileName);

    // Save Result to DB
    await Resume.findByIdAndUpdate(resumeId, {
      parsed: true,
      parsedData,
    });
    
    console.log(`[Bull] Resume parsed successfully for ${resumeId}`);

    done(null, { success: true, resumeId });
  } catch (error) {
    console.error("[Bull] Resume parse error:", error);
    done(error);
  }
});
