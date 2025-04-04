import { transporter } from '../config/nodemailer';

export class EmailService {
  static async sendVerificationEmail(name:string, email: string, token: string) {
    try {
      await transporter.sendMail({
        from: '"Budget Control" <budget-control@gmail.com>',
        to: email,
        subject: "Verify account",
        text: "Please verify your account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
          <h2 style="color: #333;">👋 Hello ${name}</h2>
          <p style="font-size: 16px; color: #555;">Thanks for signing up to <strong>Budget Control</strong>.</p>
          <p style="font-size: 16px; color: #555;">To verify your account, please use the verification code below:</p>
          
          <div style="margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2c3e50; padding: 10px 15px; background-color: #e1ecf4; border-radius: 6px;">
              ${token}
            </span>
          </div>

          <a href="#" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Confirm Account
          </a>

          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn’t request this, you can safely ignore this email.</p>
          <p style="font-size: 14px; color: #999;">— Budget Control Team</p>
        </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }
}

