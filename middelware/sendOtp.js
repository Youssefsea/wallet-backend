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
  `<div style="flex:0 0 auto;width:clamp(36px,10vw,46px);height:clamp(44px,12vw,54px);background:rgba(212,175,55,0.1);border:1.5px solid rgba(212,175,55,0.35);border-radius:10px;font-size:clamp(20px,5vw,26px);font-weight:700;color:#D4AF37;display:inline-flex;align-items:center;justify-content:center;font-family:monospace;">${d}</div>`
).join('');

let info = await transporter.sendMail({
  from: '"WealthWise" <yassefsea274@gmail.com>',
  to,
  subject: "رمز التحقق - WealthWise",
  html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:20px;background:#F6F8F6;font-family:'Cairo',sans-serif;direction:rtl;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5E7EB;">

    <div style="background:linear-gradient(135deg,#1C5F20,#144317);padding:2rem;text-align:center;">
      <p style="color:#D4AF37;font-size:22px;font-weight:700;margin:0 0 1.5rem;">WealthWise 💳</p>
      <div style="width:68px;height:68px;background:rgba(212,175,55,0.15);border-radius:50%;margin:0 auto 1rem;display:inline-flex;align-items:center;justify-content:center;border:2px solid rgba(212,175,55,0.4);">
        <span style="font-size:28px;">🔐</span>
      </div>
      <p style="color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:2px;margin:0;">التحقق من الهوية</p>
    </div>

    <div style="padding:2rem;">
      <h2 style="font-size:20px;font-weight:700;color:#1A1A1A;margin:0 0 0.75rem;">مرحباً! 👋</h2>
      <p style="font-size:14px;color:#6B7280;line-height:1.8;margin:0 0 1.75rem;">
        تلقّينا طلبًا للتحقق من هويتك على منصة <strong style="color:#1C5F20;">WealthWise</strong>.
        الرمز صالح لمدة <strong style="color:#1A1A1A;">10 دقائق</strong> فقط.
      </p>

      <div style="background:#0D2B0F;border-radius:14px;padding:1.75rem;text-align:center;margin-bottom:1.75rem;">
        <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:3px;margin:0 0 1rem;">رمز التحقق OTP</p>
     <div style="display:flex;justify-content:center;gap:6px;direction:ltr;">
  ${otpDigits}
</div>
        <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:12px 0 0;">⏱ ينتهي خلال 10 دقائق</p>
      </div>

      <div style="background:#FFFBEB;border:1px solid #F59E0B;border-radius:10px;padding:12px 14px;margin-bottom:1.75rem;">
        <p style="font-size:12px;color:#92400e;margin:0;line-height:1.7;">
          ⚠️ إذا لم تطلب هذا الرمز، يُرجى تجاهل هذا الإيميل وتأمين حسابك فورًا.
        </p>
      </div>

      <div style="border-top:1px solid #EEEEEE;padding-top:1.25rem;text-align:center;">
        <p style="font-size:11px;color:#9CA3AF;margin:0;line-height:1.7;">
          هذا الإيميل تلقائي · لا ترد على هذا الإيميل<br>
          © 2025 WealthWise. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>

  </div>
</body>
</html>`
});

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
module.exports = { sendEmail };