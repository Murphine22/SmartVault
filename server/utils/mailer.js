const nodemailer = require('nodemailer');

const sendInvitationEmail = async ({ to, inviteeName, inviteLink, inviterName }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'smartvault@local.test',
    to,
    subject: 'You are invited to SmartVault',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Welcome to SmartVault</h2>
        <p>Hello ${inviteeName},</p>
        <p>${inviterName || 'An admin'} has invited you to join the SmartVault workspace.</p>
        <p><a href="${inviteLink || 'http://localhost:3000/register'}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Accept invitation</a></p>
        <p>If you already have an account, you can sign in and access your workspace directly.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = { sendInvitationEmail };
