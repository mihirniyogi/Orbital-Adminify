import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

interface EmailData {
  [key: string]: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  templateHtmlFilename: string,
  data?: EmailData
) {
  try {
    const templatePath = path.join(
      process.cwd(),
      "public",
      "email_templates",
      templateHtmlFilename
    );
    let htmlContent = await fs.readFile(templatePath, "utf-8");

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        htmlContent = htmlContent.replace(`{{${key}}}`, value);
      }
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html: htmlContent,
    };

    await transport.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}
