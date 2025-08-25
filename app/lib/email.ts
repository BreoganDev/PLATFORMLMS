
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create reusable transporter
let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter!;
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Send email function
export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<boolean> {
  // Check if email configuration is available
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email not configured - skipping email notification to:', to);
    return false;
  }

  try {
    const emailTransporter = getEmailTransporter();
    
    await emailTransporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'LMS Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Test email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    const emailTransporter = getEmailTransporter();
    await emailTransporter.verify();
    console.log('Email connection verified');
    return true;
  } catch (error) {
    console.error('Email connection failed:', error);
    return false;
  }
}
