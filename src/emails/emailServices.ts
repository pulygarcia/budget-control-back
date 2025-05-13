import { transporter } from '../config/nodemailer';

export class EmailService {
  static async sendVerificationEmail(username:string, email: string, token: string) {
    try {
      await transporter.sendMail({
        from: '"Budget Control" <budget-control@gmail.com>',
        to: email,
        subject: "Verify account",
        text: "Please verify your account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9; text-align: center;">
          <h2 style="color: #333;">👋 Hello ${username}</h2>
          <p style="font-size: 16px; color: #555;">Thanks for signing up to <strong>Budget Control</strong>.</p>
          <p style="font-size: 16px; color: #555;">To verify your account, please use the verification code below:</p>
          
          <div style="margin: 20px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #2c3e50; padding: 10px 15px; background-color: #e1ecf4; border-radius: 6px;">
              ${token}
            </span>
          </div>

          <a href="${process.env.FRONTEND_URL}/auth/verify-account" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px; margin-top: 10px;">
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

  static async sendConfirmedAccountEmail(username:string, email: string) {
    try {
      await transporter.sendMail({
      from: '"Budget Control" <budget-control@gmail.com>',
      to: email,
      subject: "Account Verified Successfully ✅",
      text: "Your account has been verified. Enjoy Budget Control!",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f0fff4; text-align: center;">
        <h2 style="color: #2d7a46;">🎉 Hello ${username},</h2>
        <p style="font-size: 16px; color: #333;">Your account was successfully verified.</p>
        <p style="font-size: 16px; color: #333;">Welcome aboard! Now you can enjoy all the features of <strong>Budget Control</strong>.</p>
        
        <div style="margin: 25px 0;">
          <span style="display: inline-block; font-size: 20px; font-weight: bold; color: #2d7a46; background-color: #d4edda; padding: 12px 18px; border-radius: 6px;">
            ✅ Verified Account
          </span>
        </div>

        <p style="font-size: 14px; color: #666;">Need help or have questions? Just reply to this email.</p>
        <p style="font-size: 14px; color: #666;">— The Budget Control Team</p>
      </div>
      `,
    });
    } catch (error) {
      console.error('Failed to send confirmed account email:', error);
      throw error;
    }
  }

  static async sendForgotPasswordEmail(email: string, token: string) {
    try {
      await transporter.sendMail({
        from: '"Budget Control" <budget-control@gmail.com>',
        to: email,
        subject: "Reset Your Password 🛡️",
        text: `Hello, your 6-digit code to reset your password is: ${token}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #fff8e1; text-align: center;">
            <h2 style="color: #d17c00;">🔐 Hello</h2>
            <p style="font-size: 16px; color: #333;">You requested to reset your password for <strong>Budget Control</strong>.</p>
            <p style="font-size: 16px; color: #333;">Please visit the following link and enter the code below to reset your password:</p>
            
            <div style="margin: 20px 0;">
              <a href="http://localhost:3000/auth/reset-password" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-weight: bold; color: white; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </div>
      
            <p style="font-size: 16px; color: #333;">Your 6-digit code:</p>
            <div style="margin: 20px 0;">
              <span style="display: inline-block; font-size: 28px; font-weight: bold; color: #b45f06; background-color: #fff3cd; padding: 12px 20px; border-radius: 6px; letter-spacing: 3px;">
                ${token}
              </span>
            </div>
      
            <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #666;">If you didn’t request a password reset, please ignore this email.</p>
            <p style="font-size: 14px; color: #666;">— The Budget Control Team</p>
          </div>
        `,
      });
      
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }
  
}

