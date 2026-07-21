import PDFDocument from "pdfkit";

class PdfService {
  generateInterviewReportPDF(session) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Styles and colors
        const primaryColor = "#0F172A"; // Slate 900
        const secondaryColor = "#475569"; // Slate 600
        const accentColor = "#2563EB"; // Blue 600
        
        // Title Header
        doc.fillColor(primaryColor).fontSize(24).text("AI Interview Performance Report", { align: "center" });
        doc.moveDown(1);
        
        // Metadata
        doc.fillColor(secondaryColor).fontSize(10);
        doc.text(`Job Title: ${session.jobTitle}`);
        doc.text(`Interview Type: ${session.type.toUpperCase()}`);
        doc.text(`Date: ${new Date(session.completedAt || session.updatedAt).toLocaleDateString()}`);
        doc.moveDown(0.5);
        doc.text(`Overall Score: `, { continued: true }).fillColor(accentColor).fontSize(16).text(`${session.overallScore}/100`);
        
        doc.moveDown(1.5);
        doc.strokeColor("#CBD5E1").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        // Key Insights
        doc.fillColor(primaryColor).fontSize(14).text("Key Insights", { underline: true });
        doc.moveDown(0.5);
        
        doc.fontSize(11).fillColor(primaryColor).text("Strengths:");
        if (session.strengths && session.strengths.length > 0) {
          session.strengths.forEach((str) => {
            doc.fillColor(secondaryColor).text(`• ${str}`, { indent: 15 });
          });
        } else {
          doc.fillColor(secondaryColor).text("None recorded.", { indent: 15 });
        }
        
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor(primaryColor).text("Areas for Improvement:");
        if (session.improvements && session.improvements.length > 0) {
          session.improvements.forEach((imp) => {
            doc.fillColor(secondaryColor).text(`• ${imp}`, { indent: 15 });
          });
        } else {
          doc.fillColor(secondaryColor).text("None recorded.", { indent: 15 });
        }
        
        doc.moveDown(1.5);
        doc.strokeColor("#CBD5E1").moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        // Q&A Breakdown
        doc.fillColor(primaryColor).fontSize(14).text("Question & Answer Breakdown", { underline: true });
        doc.moveDown(1);

        session.questions.forEach((q, idx) => {
          doc.fillColor(accentColor).fontSize(12).text(`Question ${idx + 1}: ${q.question}`);
          doc.moveDown(0.5);
          
          doc.fillColor(primaryColor).fontSize(10).text("Candidate's Answer:");
          doc.fillColor(secondaryColor).text(q.answer || "No answer provided.", { indent: 10 });
          doc.moveDown(0.5);

          if (q.followUp) {
            doc.fillColor(primaryColor).fontSize(10).text("AI Follow-up Question:");
            doc.fillColor(secondaryColor).text(q.followUp, { indent: 10 });
            doc.moveDown(0.5);
            doc.fillColor(primaryColor).fontSize(10).text("Candidate's Follow-up Answer:");
            doc.fillColor(secondaryColor).text(q.followUpAnswer || "No answer provided.", { indent: 10 });
            doc.moveDown(0.5);
          }

          doc.fillColor(primaryColor).fontSize(10).text(`Score: `, { continued: true }).fillColor(accentColor).text(`${q.score}/100`);
          doc.moveDown(0.2);
          doc.fillColor(primaryColor).fontSize(10).text("AI Feedback:");
          doc.fillColor(secondaryColor).text(q.feedback || "No feedback generated.", { indent: 10 });
          doc.moveDown(1.5);
        });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new PdfService();
