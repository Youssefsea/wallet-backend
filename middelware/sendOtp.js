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
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <title>رمز التحقق - WealthWise</title>
  <style>
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      .content-padding {
        padding: 30px 20px 20px 20px !important;
      }
      .title-text {
        font-size: 24px !important;
      }
      .body-text {
        font-size: 15px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Cairo','Segoe UI',Tahoma,sans-serif;direction:rtl;-webkit-font-smoothing:antialiased;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        
        <table class="email-container" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.02);">

          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <span style="font-size:18px;color:#0a2540;letter-spacing:1px;font-weight:900;font-family:'Cairo',sans-serif;">
                WEALTHWISE
              </span>
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding:32px 40px 40px;text-align:center;">
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="width:64px;height:64px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:50%;text-align:center;vertical-align:middle;font-size:24px;line-height:64px;">
                    🔒
                  </td>
                </tr>
              </table>

              <h1 class="title-text" style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0a2540;font-family:'Cairo',sans-serif;">
                التحقق من الهوية
              </h1>
              
              <p class="body-text" style="margin:0 0 32px;font-size:16px;color:#475569;line-height:1.6;font-family:'Cairo',sans-serif;">
                مرحباً بك،<br>
                لقد تلقينا طلباً للتحقق من هويتك. يرجى استخدام الرمز أدناه لإكمال العملية.
              </p>

              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;border-radius:8px;border:1px dashed #cbd5e1;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px 20px;text-align:center;">
                    <p style="margin:0 0 16px;font-size:12px;color:#64748b;font-weight:600;letter-spacing:1px;">رمز التحقق الخاص بك</p>
                    
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;font-size:28px;font-weight:800;color:#0f172a;letter-spacing:6px;font-family:monospace;" dir="ltr">
                      <tr>${otpDigits}</tr>
                    </table>

                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:14px;color:#64748b;font-family:'Cairo',sans-serif;font-weight:600;">
                ⏱ صالح لمدة <span style="color:#0a2540;">10 دقائق</span> فقط
              </p>

              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#fffbeb;border-right:3px solid #fbbf24;border-radius:4px;padding:16px;text-align:right;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size:13px;color:#92400e;line-height:1.6;font-family:'Cairo',sans-serif;">
                          <strong>ملاحظة أمنية:</strong> إذا لم تقم بطلب هذا الرمز، يُرجى تجاهل هذه الرسالة وتأمين حسابك فوراً. نحن لا نطلب منك كلمة المرور أو هذا الرمز أبداً.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-family:'Cairo',sans-serif;">
                هذه رسالة تلقائية، يُرجى عدم الرد عليها.
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">
                © 2025 WealthWise. All Rights Reserved.
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