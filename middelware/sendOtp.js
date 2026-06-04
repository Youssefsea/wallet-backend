require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function buildOtpDigits(OTP) {
  return OTP.toString()
    .split("")
    .map(
      (d) => `
      <td style="padding: 0 5px;">
        <div style="
          width: 52px;
          height: 64px;
          background: linear-gradient(145deg, #1a1a2e, #16213e);
          border: 1.5px solid #D4AF37;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #D4AF37;
          font-family: 'Courier New', monospace;
          line-height: 64px;
        ">${d}</div>
      </td>`
    )
    .join("");
}

function buildEmailHTML(OTP) {
  const otpDigits = buildOtpDigits(OTP);

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>رمز التحقق - WealthWise</title>

<style>
body{
  margin:0;
  padding:0;
  background:#f4f6f8;
  font-family:'Segoe UI',Tahoma,sans-serif;
  direction:rtl;
}

@media screen and (max-width:600px){

  .container{
    width:100% !important;
  }

  .content-padding{
    padding:20px 16px !important;
  }

  .title-text{
    font-size:22px !important;
  }

  .otp-space{
    padding:16px 8px !important;
  }

  .otp-digit{
    width:42px !important;
    height:42px !important;
    font-size:22px !important;
  }

  .logo-text{
    font-size:16px !important;
  }
}

@media screen and (max-width:400px){

  .content-padding{
    padding:16px 12px !important;
  }

  .title-text{
    font-size:20px !important;
  }

  .otp-digit{
    width:34px !important;
    height:34px !important;
    font-size:18px !important;
  }

  .otp-gap{
    width:4px !important;
  }

  .body-text{
    font-size:14px !important;
  }
}
</style>
</head>

<body>

<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="background:#f4f6f8;"
>
<tr>
<td align="center" style="padding:24px 8px;">

<table
  class="container"
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    max-width:500px;
    width:100%;
    background:#ffffff;
    border-radius:12px;
    border:1px solid #e2e8f0;
    overflow:hidden;
  "
>

<!-- Logo -->
<tr>
<td align="center" style="padding:28px 20px 10px;">
<span
  class="logo-text"
  style="
    font-size:18px;
    color:#0a2540;
    font-weight:900;
    letter-spacing:1px;
  "
>
WEALTHWISE
</span>
</td>
</tr>

<!-- Content -->
<tr>
<td
  class="content-padding"
  align="center"
  style="
    padding:24px 28px 30px;
    text-align:center;
  "
>

<!-- Icon -->
<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  align="center"
  style="margin:0 auto 16px;"
>
<tr>
<td
  align="center"
  style="
    width:56px;
    height:56px;
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:50%;
    font-size:24px;
    line-height:56px;
  "
>
🔒
</td>
</tr>
</table>

<h1
  class="title-text"
  style="
    margin:0 0 12px;
    font-size:24px;
    color:#0a2540;
    font-weight:800;
  "
>
التحقق من الهوية
</h1>

<p
  class="body-text"
  style="
    margin:0 0 24px;
    font-size:15px;
    color:#475569;
    line-height:1.8;
  "
>
مرحباً بك،<br>
لقد تلقينا طلباً للتحقق من هويتك.
<br>
يرجى استخدام الرمز أدناه لإكمال العملية.
</p>

<!-- OTP Box -->
<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
  style="
    background:#f8fafc;
    border:1px dashed #cbd5e1;
    border-radius:8px;
    margin-bottom:20px;
  "
>
<tr>
<td
  class="otp-space"
  align="center"
  style="
    padding:20px 10px;
  "
>

<p
  style="
    margin:0 0 14px;
    font-size:12px;
    color:#64748b;
    font-weight:600;
  "
>
رمز التحقق الخاص بك
</p>

<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  align="center"
  style="
    margin:0 auto;
    max-width:100%;
    font-family: Arial, Helvetica, sans-serif;
  "
  dir="ltr"
>
<tr>
${otpDigits}
</tr>
</table>

</td>
</tr>
</table>

<p
  style="
    margin:0 0 24px;
    font-size:13px;
    color:#64748b;
    font-weight:600;
  "
>
⏱ صالح لمدة
<span style="color:#0a2540;">
10 دقائق
</span>
فقط
</p>

<!-- Security Notice -->
<table
  cellpadding="0"
  cellspacing="0"
  border="0"
  width="100%"
>
<tr>
<td
  align="right"
  style="
    background:#fffbeb;
    border-right:3px solid #fbbf24;
    border-radius:6px;
    padding:12px 14px;
  "
>
<p
  style="
    margin:0;
    font-size:12px;
    color:#92400e;
    line-height:1.7;
  "
>
<strong>ملاحظة أمنية:</strong>
إذا لم تطلب هذا الرمز،
يُرجى تجاهل هذه الرسالة وتأمين حسابك فوراً.
</p>
</td>
</tr>
</table>

</td>
</tr>

<!-- Footer -->
<tr>
<td
  align="center"
  style="
    background:#f8fafc;
    border-top:1px solid #e2e8f0;
    padding:18px;
  "
>
<p
  style="
    margin:0 0 6px;
    font-size:11px;
    color:#64748b;
  "
>
هذه رسالة تلقائية، يُرجى عدم الرد عليها.
</p>

<p
  style="
    margin:0;
    font-size:10px;
    color:#94a3b8;
    font-family:monospace;
    letter-spacing:1px;
  "
>
© 2026 WEALTHWISE. ALL RIGHTS RESERVED.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

async function sendEmail(to, OTP) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@httpsfood-front-rho.me', // غيّر للدومين الخاص بك بعد التحقق منه في Resend
      to,
      subject: "رمز التحقق - WealthWise",
      html: buildEmailHTML(OTP),
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully. ID:", data.id);
    return data;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
}

module.exports = { sendEmail };