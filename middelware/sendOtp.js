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
  `<td style="padding:0 4px;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="width:44px;height:54px;background:#1a3d1c;border:2px solid #D4AF37;border-radius:12px;text-align:center;vertical-align:middle;font-size:26px;font-weight:700;color:#D4AF37;font-family:'Courier New',monospace;letter-spacing:0;">${d}</td>
      </tr>
    </table>
  </td>`
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Cairo','Segoe UI',Tahoma,sans-serif;direction:rtl;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0a0a0a;padding:30px 10px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#111111;border-radius:20px;overflow:hidden;border:1px solid #222222;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D2B0F 0%,#1C5F20 50%,#0D2B0F 100%);padding:40px 30px 35px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:70px;height:70px;background:linear-gradient(135deg,#D4AF37,#B8962E);border-radius:50%;text-align:center;vertical-align:middle;">
                          <span style="font-size:32px;line-height:70px;">&#x1F4B3;</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:28px;font-weight:700;color:#D4AF37;letter-spacing:2px;padding-bottom:8px;font-family:'Cairo','Segoe UI',sans-serif;">WealthWise</td>
                </tr>
                <tr>
                  <td align="center" style="font-size:11px;color:rgba(212,175,55,0.6);letter-spacing:4px;text-transform:uppercase;">SECURE VERIFICATION</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider line -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,transparent,#D4AF37,transparent);"></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 30px 30px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size:22px;font-weight:700;color:#ffffff;padding-bottom:10px;font-family:'Cairo','Segoe UI',sans-serif;">&#x1F44B; !مرحبا</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#888888;line-height:1.9;padding-bottom:30px;font-family:'Cairo','Segoe UI',sans-serif;">
                    تلقّينا طلبا للتحقق من هويتك على منصة <strong style="color:#D4AF37;">WealthWise</strong>.
                    استخدم الرمز التالي لاكمال عملية التحقق.
                  </td>
                </tr>
              </table>

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0D2B0F;border-radius:16px;border:1px solid rgba(212,175,55,0.2);">
                <tr>
                  <td style="padding:30px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="font-size:11px;color:rgba(212,175,55,0.5);letter-spacing:4px;padding-bottom:18px;text-transform:uppercase;">&#x1F512; رمز التحقق</td>
                      </tr>
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0" dir="ltr" style="margin:0 auto;">
                            <tr>
                              ${otpDigits}
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top:18px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="background:rgba(212,175,55,0.1);border-radius:20px;margin:0 auto;">
                            <tr>
                              <td style="padding:6px 16px;font-size:12px;color:#D4AF37;font-family:'Cairo','Segoe UI',sans-serif;">&#x23F1; صالح لمدة <strong>10 دقائق</strong></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:25px;">
                <tr>
                  <td style="background:#1a1207;border:1px solid #3d2e0a;border-radius:12px;padding:14px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:24px;vertical-align:top;padding-top:2px;font-size:16px;">&#x26A0;&#xFE0F;</td>
                        <td style="font-size:12px;color:#D4A017;line-height:1.8;padding-right:8px;font-family:'Cairo','Segoe UI',sans-serif;">
                          اذا لم تطلب هذا الرمز، يرجى تجاهل هذا الايميل وتامين حسابك فورا.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,#222222,transparent);"></td>
          </tr>
          <tr>
            <td style="padding:20px 30px 25px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="font-size:11px;color:#444444;line-height:1.8;font-family:'Cairo','Segoe UI',sans-serif;">
                    هذا الايميل تلقائي &middot; لا ترد على هذا الايميل<br>
                    &copy; 2025 WealthWise. جميع الحقوق محفوظة.
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
</html>`
});

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}


module.exports = { sendEmail };