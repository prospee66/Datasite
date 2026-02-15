const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    this.fromEmail = process.env.EMAIL_USER || 'noreply@optimisticempire.com';
    this.brandName = 'OPTIMISTIC EMPIRE';
  }

  async sendPasswordReset(to, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">${this.brandName}</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="margin-top:0;">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Reset Password</a>
          </div>
          <p style="color:#666;font-size:14px;">This link expires in <strong>30 minutes</strong>.</p>
          <p style="color:#666;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            ${this.brandName} - Affordable Data Bundles in Ghana
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: 'Reset Your Password - OPTIMISTIC EMPIRE',
        html
      });
      console.log(`[Email] Password reset sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('[Email] Send error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async sendWelcome(to, firstName) {
    const html = `
      <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">${this.brandName}</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="margin-top:0;">Welcome, ${firstName}!</h2>
          <p>Your account has been created successfully. You can now buy affordable data bundles for MTN, Telecel, and AirtelTigo.</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/buy-data" style="background:#2563eb;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Buy Data Now</a>
          </div>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            ${this.brandName} - Affordable Data Bundles in Ghana
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: `Welcome to ${this.brandName}!`,
        html
      });
      console.log(`[Email] Welcome email sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('[Email] Welcome email error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async sendOrderConfirmation(to, order) {
    const html = `
      <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:24px;">${this.brandName}</h1>
        </div>
        <div style="padding:30px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <h2 style="margin-top:0;">Order Received!</h2>
          <p>Your data bundle order has been received and will be delivered shortly.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:4px 0;"><strong>Bundle:</strong> ${order.dataAmount} ${order.network}</p>
            <p style="margin:4px 0;"><strong>Phone:</strong> ${order.recipientPhone}</p>
            <p style="margin:4px 0;"><strong>Amount:</strong> GHS ${order.amount}</p>
            <p style="margin:4px 0;"><strong>Ref:</strong> ${order.transactionRef}</p>
          </div>
          <p style="color:#666;font-size:14px;">You'll receive your data within a few minutes. Contact us on WhatsApp if you need help.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#999;font-size:12px;text-align:center;">
            ${this.brandName} - Affordable Data Bundles in Ghana
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${this.brandName}" <${this.fromEmail}>`,
        to,
        subject: `Order Confirmed - ${order.dataAmount} ${order.network}`,
        html
      });
      console.log(`[Email] Order confirmation sent to ${to}`);
      return { success: true };
    } catch (error) {
      console.error('[Email] Order confirmation error:', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
