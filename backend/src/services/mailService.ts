import dns from 'dns';
import nodemailer from 'nodemailer';

// Forzar resolución IPv4 primero para evitar error ENETUNREACH en contenedores Linux/Render/Docker sin IPv6
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

export interface SendRecoveryEmailOptions {
  toEmail: string;
  userName: string;
  resetCode: string;
  resetLink?: string;
}

// Configuración del transporte SMTP con soporte específico para Gmail sobre IPv4
function createTransporter() {
  const user = (process.env.SMTP_USER || 'nolazcomaury2004@gmail.com').trim();
  // Limpia cualquier espacio si se ingresó la clave con espacios (ej. "bxyy zmeh egwz faru")
  const pass = (process.env.SMTP_PASS || 'bxyyzmehegwzfaru').trim().replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
}

export async function sendPasswordRecoveryEmail(options: SendRecoveryEmailOptions): Promise<{ success: boolean; message: string }> {
  const { toEmail, userName, resetCode, resetLink } = options;
  const fromUser = process.env.SMTP_USER || 'nolazcomaury2004@gmail.com';
  const fromAddress = process.env.SMTP_FROM || `"GPON Telecom S.A. de C.V." <${fromUser}>`;

  // Plantilla HTML corporativa sobria, limpia y sin emojis
  const htmlContent = `
<!DOCTYPE html>
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
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          
          <!-- Encabezado Institucional Sobrio -->
          <tr>
            <td style="background-color: #0f172a; padding: 22px 28px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #38bdf8; letter-spacing: 1.2px; text-transform: uppercase;">
                      GPON TELECOM
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                      Sistema de Gestión y Mapeo de Red
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 17px; font-weight: 700; color: #0f172a;">
                Recuperación de contraseña
              </h2>
              <p style="margin: 0 0 14px 0; color: #334155; font-size: 14px; line-height: 1.5;">
                Hola, ${userName}:
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 13px; line-height: 1.6;">
                Recibimos una solicitud para restablecer tu contraseña de acceso en la plataforma de <strong>GPON Telecom</strong>. Ingresa el siguiente código de seguridad en el formulario:
              </p>

              <!-- Bloque del Código -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 22px 0;">
                <div style="font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                  Código de verificación
                </div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: 'Consolas', 'Courier New', monospace; padding: 4px 0;">
                  ${resetCode}
                </div>
                <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                  Válido durante 3 minutos
                </div>
              </div>

              ${resetLink ? `
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              ` : ''}

              <!-- Nota de Seguridad sin alertas amarillas ni emojis -->
              <p style="margin: 22px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                Si tú no solicitaste este cambio, puedes ignorar este correo con tranquilidad. Tu contraseña actual permanecerá sin modificaciones.
              </p>
            </td>
          </tr>

          <!-- Pie Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                GPON TELECOM S.A. DE C.V. • San José del Rincón, Estado de México
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
</html>
`;

  // 1. MÉTODO PRIORITARIO EN LA NUBE: Enviar por HTTPS a través de Vercel Serverless Function
  // El puerto 443 (HTTPS) NUNCA es bloqueado por Render ni por firewalls en la nube
  try {
    const vercelMailerUrl = process.env.VERCEL_MAILER_URL || 'https://redes-gpon-ft-txs.vercel.app/api/send-mail';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(vercelMailerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        toEmail,
        userName,
        resetCode,
        htmlContent
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: any = await response.json();
      if (data.success) {
        console.log(`[Vercel Relay HTTPS] Correo enviado satisfactoriamente a: ${toEmail}`);
        return {
          success: true,
          message: `Código enviado satisfactoriamente a ${toEmail}. Revisa tu bandeja de entrada o carpeta de spam.`
        };
      }
    }
  } catch (err: any) {
    console.warn('[Vercel Relay HTTPS info]:', err.message);
  }

  // 2. MÉTODO DIRECTO / LOCAL: Enviar mediante Nodemailer SMTP nativo
  const transporter = createTransporter();

  if (!transporter) {
    const errorMsg = 'El servidor no tiene configurada la contraseña de aplicación de Gmail (SMTP_PASS) en backend/.env.';
    console.error(`[SMTP ERROR] ${errorMsg}`);
    return {
      success: false,
      message: errorMsg
    };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Código de verificación: ${resetCode} - GPON Telecom`,
      text: `Hola ${userName},\n\nTu código de verificación para GPON Telecom es: ${resetCode}\nVálido durante 3 minutos.\n\nSi no realizaste esta solicitud, puedes ignorar este mensaje.`,
      html: htmlContent
    });

    console.log(`[SMTP Directo] Correo de recuperación enviado satisfactoriamente a: ${toEmail}`);
    return {
      success: true,
      message: `Código enviado satisfactoriamente a ${toEmail}. Revisa tu bandeja de entrada o carpeta de spam.`
    };
  } catch (error: any) {
    console.error('[SMTP ERROR] Error al enviar correo vía Gmail:', error);
    let detail = error.message || 'Error al comunicarse con el servidor de correo.';
    if (detail.includes('Invalid login') || detail.includes('Username and Password not accepted') || detail.includes('535-5.7.8')) {
      detail = 'Credenciales de Gmail incorrectas. Recuerda que debes usar una "Contraseña de aplicación" de 16 caracteres generada desde tu cuenta de Google.';
    }
    return {
      success: false,
      message: detail
    };
  }
}
