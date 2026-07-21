import nodemailer from "nodemailer";
import handlebars from "handlebars";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_EMAIL || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });
  }

  async sendReportEmail(userEmail, userName, session, pdfUrl) {
    try {
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; }
            .container { max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 30px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 24px; color: #0F172A; margin-bottom: 20px; text-align: center; }
            p { font-size: 16px; color: #475569; line-height: 1.6; }
            .meta { background-color: #F1F5F9; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .meta-item { font-size: 14px; margin-bottom: 8px; }
            .score-highlight { font-size: 28px; font-weight: bold; color: #2563EB; display: block; text-align: center; margin: 15px 0; }
            .btn { display: block; text-align: center; background-color: #2563EB; color: #FFFFFF !important; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; margin-top: 25px; }
            .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Interview Performance Report</h1>
            <p>Hi {{userName}},</p>
            <p>Congratulations on completing your AI Interview Practice session! Below is a summary of your performance.</p>
            
            <div class="score-highlight">
              Score: {{session.overallScore}}/100
            </div>

            <div class="meta">
              <div class="meta-item"><strong>Job Title:</strong> {{session.jobTitle}}</div>
              <div class="meta-item"><strong>Interview Type:</strong> {{session.type}}</div>
              <div class="meta-item"><strong>Date:</strong> {{date}}</div>
            </div>

            <p>You can access your detailed feedback and download the full PDF report by clicking the button below:</p>
            
            <a href="{{pdfUrl}}" class="btn">View Full PDF Report</a>

            <div class="footer">
              Sent by AI Career Copilot. Empowering your career development.
            </div>
          </div>
        </body>
        </html>
      `;

      const template = handlebars.compile(emailTemplate);
      const html = template({
        userName,
        session: typeof session.toObject === "function" ? session.toObject() : session,
        pdfUrl,
        date: new Date(session.completedAt || session.updatedAt).toLocaleDateString(),
      });

      const mailOptions = {
        from: `"${process.env.SMTP_SENDER_NAME || 'AI Career Copilot'}" <${process.env.SMTP_EMAIL || 'no-reply@career-copilot.com'}>`,
        to: userEmail,
        subject: `Your AI Interview Performance Report: ${session.jobTitle}`,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("🚀 Report Email Sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("❌ Failed to send report email:", error.message);
      // Don't throw so it doesn't block completion if SMTP is not configured
      return null;
    }
  }
}

export default new EmailService();
