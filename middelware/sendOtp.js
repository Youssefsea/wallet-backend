const nodemailer = require("nodemailer"); 
  require('dotenv').config();
 


async function sendEmail(to, OTP) {
  try {
   const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "yassefsea274@gmail.com",       
        pass: "vjgf odiu nnul krpg"   
      }
    });

const otpDigits = OTP.toString().split('').map(d =>
  `<span style="display:inline-block;width:42px;height:50px;background:rgba(255,255,255,0.06);border:1px solid rgba(59,130,246,0.3);border-radius:8px;font-size:24px;font-weight:500;color:#60a5fa;line-height:50px;font-family:monospace;text-align:center;">${d}</span>`
).join('');

let info = await transporter.sendMail({
  from: '"My Shop" <yassefsea274@gmail.com>',
  to,
  subject: "رمز التحقق - My Wallet",
  html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

    <div style="background:#0f172a;padding:2rem;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:1.5rem;">
        <div style="width:36px;height:36px;background:#3b82f6;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:18px;">💳</span>
        </div>
        <span style="color:white;font-size:18px;font-weight:bold;">My Wallet</span>
      </div>
      <div style="width:64px;height:64px;background:rgba(59,130,246,0.15);border-radius:50%;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;border:2px solid rgba(59,130,246,0.4);">
        <span style="font-size:28px;">🔐</span>
      </div>
      <p style="color:#94a3b8;font-size:12px;letter-spacing:2px;margin:0;">التحقق من الهوية</p>
    </div>

    <div style="padding:2rem;">
      <h2 style="font-size:20px;color:#1e293b;margin:0 0 0.75rem;">مرحباً!</h2>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 1.5rem;">
        تلقّينا طلبًا للتحقق من هويتك. استخدم الرمز أدناه لإتمام العملية.
        الرمز صالح لمدة <strong style="color:#1e293b;">10 دقائق</strong> فقط.
      </p>

      <div style="background:#0f172a;border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;">
        <p style="color:#64748b;font-size:11px;letter-spacing:2px;margin:0 0 0.75rem;">رمز التحقق</p>
        <div style="display:flex;justify-content:center;gap:10px;">
          ${otpDigits}
        </div>
      </div>

      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin-bottom:1.5rem;">
        <p style="font-size:12px;color:#92400e;margin:0;line-height:1.6;">
          ⚠️ إذا لم تطلب هذا الرمز، يُرجى تجاهل هذا الإيميل وتأمين حسابك فورًا.
        </p>
      </div>

      <div style="border-top:1px solid #f1f5f9;padding-top:1.25rem;text-align:center;">
        <p style="font-size:12px;color:#94a3b8;margin:0;">
          هذا الإيميل تلقائي من <strong>My Wallet</strong> · لا ترد على هذا الإيميل
        </p>
      </div>
    </div>

  </div>
</body>
</html>`,
});

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
module.exports = { sendEmail };