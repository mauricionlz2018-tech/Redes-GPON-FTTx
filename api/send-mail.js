const nodemailer = require('nodemailer');

function buildEmailHtml(userName, resetCode) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificación - GPON Telecom</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);">
          
          <!-- Encabezado con Logo Oficial de GPON Telecom -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; border-bottom: 2px solid #0284c7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="https://redes-gpon-ft-txs.vercel.app/logo-gpon.png" alt="GPON Telecom" width="145" style="display: block; max-width: 145px; height: auto; border: 0;" />
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.8px; background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 6px;">
                      Seguridad
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                Código de verificación de acceso
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.5;">
                Hola, ${userName || 'Usuario'}:
              </p>
              <p style="margin: 0 0 22px 0; color: #475569; font-size: 13px; line-height: 1.6;">
                Has solicitado restablecer tu contraseña en el sistema de <strong>GPON Telecom</strong>. Introduce el siguiente código de seguridad en el formulario:
              </p>

              <!-- Tarjeta de Código Limpia y Sobria -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                  Código de verificación
                </div>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #0284c7; font-family: 'Consolas', 'Courier New', monospace; padding: 6px 0;">
                  ${resetCode}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                  Válido durante 3 minutos
                </div>
              </div>

              <!-- Nota de Seguridad sin emojis ni alertas amarillas -->
              <p style="margin: 22px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 18px;">
                Si tú no realizaste esta solicitud, puedes ignorar este mensaje con tranquilidad. Tu contraseña actual no se modificará sin este código.
              </p>
            </td>
          </tr>

          <!-- Pie Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 32px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: 600;">
                GPON TELECOM S.A. DE C.V.
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 10px;">
                Este es un mensaje automático de seguridad. Por favor no respondas a este correo.
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

module.exports = async function handler(req, res) {
  // CORS para permitir comunicación desde cualquier origen (Render o Frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  const { toEmail, userName, resetCode } = req.body || {};

  if (!toEmail || !resetCode) {
    return res.status(400).json({ success: false, message: 'toEmail y resetCode son requeridos' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'nolazcomaury2004@gmail.com',
        pass: process.env.SMTP_PASS || 'bxyyzmehegwzfaru'
      }
    });

    const htmlContent = buildEmailHtml(userName, resetCode);

    await transporter.sendMail({
      from: '"GPON Telecom S.A. de C.V." <nolazcomaury2004@gmail.com>',
      to: toEmail,
      subject: `Código de verificación: ${resetCode} - GPON Telecom`,
      text: `Hola ${userName || 'Usuario'},\n\nTu código de verificación para GPON Telecom es: ${resetCode}\nVálido durante 3 minutos.\n\nSi no realizaste esta solicitud, ignora este mensaje.`,
      html: htmlContent
    });

    console.log(`[Vercel Mailer] Correo enviado exitosamente a: ${toEmail}`);
    return res.status(200).json({
      success: true,
      message: `Código enviado satisfactoriamente a ${toEmail}. Revisa tu bandeja de entrada o carpeta de spam.`
    });
  } catch (error) {
    console.error('[Vercel Mailer Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al despachar correo vía Gmail'
    });
  }
};
