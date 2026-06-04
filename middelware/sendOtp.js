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
</head>
<body style="margin:0;padding:0;background:#080c12;font-family:'Cairo','Segoe UI',Tahoma,sans-serif;direction:rtl;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#080c12;padding:48px 16px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;">

          <!-- ── Logo pill at top ── -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="
                    background:#0f1923;
                    border:1px solid #1e2d3d;
                    border-radius:50px;
                    padding:10px 24px;
                    display:inline-block;
                  ">
                    <span style="font-size:13px;color:#D4AF37;letter-spacing:3px;font-weight:700;font-family:'Cairo',sans-serif;">✦ WEALTHWISE ✦</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Main card ── -->
          <tr>
            <td style="
              background:#0d1520;
              border-radius:24px;
              border:1px solid #1a2a3a;
              overflow:hidden;
            ">

              <!-- Header gradient strip -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="
                    background:linear-gradient(135deg,#0a1628 0%,#0f2340 40%,#1a3a1a 100%);
                    padding:44px 40px 40px;
                    text-align:center;
                    border-bottom:1px solid #1a2a3a;
                  ">

                    <!-- Gold circle icon -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 24px;">
                      <tr>
                        <td style="
                          width:80px;height:80px;
                          background:linear-gradient(135deg,#BFA140,#D4AF37,#F0CA5E);
                          border-radius:50%;
                          text-align:center;vertical-align:middle;
                          font-size:36px;line-height:80px;
                        ">🔐</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 6px;font-size:30px;font-weight:900;color:#ffffff;font-family:'Cairo',sans-serif;letter-spacing:-0.5px;">التحقق من الهوية</p>
                    <p style="margin:0;font-size:14px;color:#5a7a9a;letter-spacing:2px;font-family:monospace;">IDENTITY VERIFICATION</p>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:40px 40px 36px;">

                    <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#e8f0fe;font-family:'Cairo',sans-serif;">مرحباً 👋</p>
                    <p style="margin:0 0 32px;font-size:14px;color:#5a7a9a;line-height:2;font-family:'Cairo',sans-serif;">
                      تلقّينا طلباً للتحقق من هويتك على منصة
                      <strong style="color:#D4AF37;">WealthWise</strong>.
                      استخدم الرمز أدناه لإكمال عملية التحقق.
                    </p>

                    <!-- OTP box -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="
                      background:linear-gradient(145deg,#060e1a,#0c1c2e);
                      border-radius:20px;
                      border:1px solid #1e3a5a;
                      margin-bottom:28px;
                    ">
                      <tr>
                        <td style="padding:32px 20px;">

                          <p style="margin:0 0 20px;text-align:center;font-size:11px;color:#3a5a7a;letter-spacing:4px;font-family:monospace;">─── رمز التحقق ───</p>

                          <!-- OTP digits -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;" dir="ltr">
                            <tr>${otpDigits}</tr>
                          </table>

                          <!-- Timer badge -->
                          <table cellpadding="0" cellspacing="0" border="0" style="margin:20px auto 0;">
                            <tr>
                              <td style="
                                background:rgba(212,175,55,0.08);
                                border:1px solid rgba(212,175,55,0.2);
                                border-radius:30px;
                                padding:7px 20px;
                              ">
                                <span style="font-size:12px;color:#D4AF37;font-family:'Cairo',sans-serif;">⏱ صالح لمدة <strong>10 دقائق</strong></span>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Warning box -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="
                          background:#100c06;
                          border:1px solid #2a1e08;
                          border-right:3px solid #D4AF37;
                          border-radius:12px;
                          padding:14px 18px;
                        ">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td style="width:28px;font-size:18px;vertical-align:middle;">⚠️</td>
                              <td style="font-size:13px;color:#a07830;line-height:1.9;font-family:'Cairo',sans-serif;padding-right:10px;">
                                إذا لم تطلب هذا الرمز، يُرجى تجاهل هذا الإيميل وتأمين حسابك فوراً.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="height:1px;background:linear-gradient(90deg,transparent,#1a2a3a,transparent);"></td>
                </tr>
                <tr>
                  <td style="padding:20px 40px 28px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;color:#2a3a4a;font-family:'Cairo',sans-serif;">
                      هذا الإيميل تلقائي · لا ترد على هذا الإيميل
                    </p>
                    <p style="margin:0;font-size:11px;color:#1e2e3e;font-family:monospace;letter-spacing:1px;">
                      © 2025 WEALTHWISE · ALL RIGHTS RESERVED
                    </p>
                  </td>
                </tr>
              </table>

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
      from: "WealthWise <onboarding@resend.dev>", // غيّر للدومين الخاص بك بعد التحقق منه في Resend
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