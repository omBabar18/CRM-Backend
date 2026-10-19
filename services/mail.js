const nodemailer = require('nodemailer')

function transport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: String(process.env.SMTP_PASS || '').replace(/\s/g, ''),
    },
  })
}

async function sendVerificationEmail({ to, name, link }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials are missing from .env')
  }
  await transport().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Verify your DG Gold account',
    text: `Hello ${name},\n\nOpen this link to verify your account, then sign in:\n${link}\n\nThis link expires in 24 hours.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.5">
        <p>Hello ${name},</p>
        <p>Confirm your DG Gold desk account. After verification you will land on the login page.</p>
        <p><a href="${link}" style="display:inline-block;background:#EAF2FF;color:#1E4A9A;text-decoration:none;padding:10px 16px;border-radius:10px;border:1px solid #C9DCFF">Verify email</a></p>
        <p style="font-size:13px;color:#64748b">Or paste this link into your browser:<br>${link}</p>
        <p style="font-size:13px;color:#64748b">This link expires in 24 hours.</p>
      </div>
    `,
  })
}

module.exports = { sendVerificationEmail }
