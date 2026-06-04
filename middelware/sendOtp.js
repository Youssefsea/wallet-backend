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
    /* تحسينات إضافية للهواتف لضمان التوسيط الكامل */
    @media screen and (max-width: 600px) {
      .content-padding {
        padding: 24px 16px !important;
      }
      .title-text {
        font-size: 22px !important;
      }
      .otp-space {
        padding: 16px 10px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Tahoma,sans-serif;direction:rtl;-webkit-text-smoothing:antialiased;width:100% !important;">

  <!-- الخلفية الكاملة للإيميل -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f6f8;width:100%;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        
        <!-- الحاوية الرئيسية: تم تغيير width إلى 100% لتناسب الموبايل، و max-width لمنع التمدد على الكمبيوتر -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:500px; width:100%; background-color:#ffffff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; margin:0 auto;">

          <!-- ── الشعار ── -->
          <tr>
            <td align="center" style="padding:32px 20px 10px;">
              <span style="font-size:18px; color:#0a2540; font-weight:900; letter-spacing:1px;">
                WEALTHWISE
              </span>
            </td>
          </tr>

          <!-- ── المحتوى ── -->
          <tr>
            <td class="content-padding" style="padding:24px 32px 32px; text-align:center;" align="center">
              
              <!-- أيقونة مبسطة -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
                <tr>
                  <td align="center" style="width:56px; height:56px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:50%; font-size:24px; line-height:56px; text-align:center; vertical-align:middle;">
                    🔒
                  </td>
                </tr>
              </table>

              <h1 class="title-text" style="margin:0 0 12px; font-size:24px; font-weight:800; color:#0a2540;">
                التحقق من الهوية
              </h1>
              
              <p style="margin:0 0 28px; font-size:15px; color:#475569; line-height:1.6;">
                مرحباً بك،<br>
                لقد تلقينا طلباً للتحقق من هويتك. يرجى استخدام الرمز أدناه لإكمال العملية.
              </p>

              <!-- مربع الرمز (OTP) - تم إضافة align="center" صريحة وإلغاء الـ letter-spacing لمنع اختفاء الحروف -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" align="center" style="background-color:#f8fafc; border-radius:8px; border:1px dashed #cbd5e1; margin-bottom:20px; width:100%;">
                <tr>
                  <td class="otp-space" style="padding:24px 16px; text-align:center;" align="center">
                    <p style="margin:0 0 16px; font-size:12px; color:#64748b; font-weight:600;">رمز التحقق الخاص بك</p>
                    
                    <!-- جدول أرقام الرمز المستدعى من الدالة -->
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto; font-size:26px; font-weight:800; color:#0f172a; font-family:monospace;" dir="ltr">
                      <tr>${otpDigits}</tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- وقت الصلاحية -->
              <p style="margin:0 0 28px; font-size:13px; color:#64748b; font-weight:600;">
                ⏱ صالح لمدة <span style="color:#0a2540;">10 دقائق</span> فقط
              </p>

              <!-- التنبيه الأمني -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="background-color:#fffbeb; border-right:3px solid #fbbf24; border-radius:4px; padding:12px 16px; text-align:right;" align="right">
                    <p style="margin:0; font-size:12px; color:#92400e; line-height:1.6;">
                      <strong>ملاحظة أمنية:</strong> إذا لم تطلب هذا الرمز، يُرجى تجاهل هذه الرسالة وتأمين حسابك فوراً.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── الفوتر ── -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:20px; text-align:center;" align="center">
              <p style="margin:0 0 6px; font-size:11px; color:#64748b;">
                هذه رسالة تلقائية، يُرجى عدم الرد عليها.
              </p>
              <p style="margin:0; font-size:10px; color:#94a3b8; font-family:monospace; letter-spacing:1px;">
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