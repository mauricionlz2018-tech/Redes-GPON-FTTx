import nodemailer from 'nodemailer';

export interface SendRecoveryEmailOptions {
  toEmail: string;
  userName: string;
  resetCode: string;
  resetLink?: string;
}

// Configuración del transporte SMTP con soporte específico para Gmail y otros proveedores
function createTransporter() {
  const user = (process.env.SMTP_USER || 'nolazcomaury2004@gmail.com').trim();
  // Limpia cualquier espacio si se ingreso la clave con espacios (ej. "bxyy zmeh egwz faru")
  const pass = (process.env.SMTP_PASS || 'bxyyzmehegwzfaru').trim().replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  const service = (process.env.SMTP_SERVICE || '').trim().toLowerCase();

  // Si se usa Gmail directamente o el usuario tiene dominio @gmail.com
  if (service === 'gmail' || user.toLowerCase().endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  // Configuración estándar para servidores SMTP dedicados o corporativos
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendPasswordRecoveryEmail(options: SendRecoveryEmailOptions): Promise<{ success: boolean; message: string }> {
  const { toEmail, userName, resetCode, resetLink } = options;
  const fromUser = process.env.SMTP_USER || 'nolazcomaury2004@gmail.com';
  const fromAddress = process.env.SMTP_FROM || `"GPON Telecom S.A. de C.V." <${fromUser}>`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Seguridad - GPON Telecom</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Encabezado Institucional -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 28px; border-bottom: 3px solid #0284c7;">
              <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                GPON TELECOM S.A. DE C.V.
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">
                Restablecimiento de Credencial de Acceso
              </h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">
                Mapeo GPON / FTTx • San José del Rincón, Estado de México
              </p>
            </td>
          </tr>

          <!-- Contenido -->
          <tr>
            <td style="padding: 28px 28px 20px 28px;">
              <p style="margin: 0 0 14px 0; color: #0f172a; font-size: 14px; font-weight: 600;">
                Estimado(a) ${userName},
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 13px; line-height: 1.6;">
                Has solicitado restablecer tu contraseña para ingresar a la plataforma de monitoreo y mapeo de red de <strong>GPON Telecom</strong>. Introduce el siguiente código de seguridad en el formulario del sistema:
              </p>

              <!-- Tarjeta de Código con Monospace limpio -->
              <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  Código de Verificación (PIN)
                </div>
                <div style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #0f172a; margin: 8px 0; font-family: 'Consolas', 'Courier New', monospace;">
                  ${resetCode}
                </div>
                <div style="font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 8px;">
                  ⏱ Este código tiene una vigencia estricta de 3 minutos
                </div>
              </div>

              ${resetLink ? `
              <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-size: 13px; font-weight: 600; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              ` : ''}

              <!-- Nota de seguridad -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 3px solid #d97706; padding: 12px 14px; border-radius: 4px; margin-top: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 11px; line-height: 1.5;">
                  <strong>Aviso de seguridad:</strong> Si no reconoces esta operación o no solicitaste este código, ningún cambio se realizará sin esta clave. Puedes desestimar este mensaje de forma segura.
                </p>
              </div>
            </td>
          </tr>

          <!-- Pie Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © 2026 GPON TELECOM S.A. DE C.V. • Departamento de Soporte Técnico y Auditoría
              </p>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 10px;">
                San José del Rincón, Estado de México
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

  const transporter = createTransporter();

  if (!transporter) {
    const errorMsg = 'El servidor no tiene configurada la contraseña de aplicación de Gmail (SMTP_PASS) en backend/.env. Para enviar correos reales, activa la verificación en 2 pasos de tu cuenta de Google, genera una "Contraseña de aplicación" de 16 caracteres y agrégala en SMTP_PASS.';
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
      subject: `Código de Seguridad (${resetCode}) - GPON Telecom`,
      text: `Hola ${userName},\n\nTu código de recuperación para GPON Telecom es: ${resetCode}\nEste código tiene una vigencia estricta de 3 minutos.\n\nSi no realizaste esta solicitud, ignora este mensaje.`,
      html: htmlContent
    });

    console.log(`[SMTP] Correo de recuperación enviado satisfactoriamente a: ${toEmail}`);
    return {
      success: true,
      message: `Código enviado satisfactoriamente a ${toEmail}. Revisa tu bandeja de entrada o carpeta de spam.`
    };
  } catch (error: any) {
    console.error('[SMTP ERROR] Error al enviar correo vía Gmail:', error);
    let detail = error.message || 'Error al comunicarse con el servidor de correo.';
    if (detail.includes('Invalid login') || detail.includes('Username and Password not accepted') || detail.includes('535-5.7.8')) {
      detail = 'Credenciales de Gmail incorrectas. Recuerda que debes usar una "Contraseña de aplicación" de 16 caracteres generada desde tu cuenta de Google (Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones), no tu contraseña normal.';
    }
    return {
      success: false,
      message: detail
    };
  }
}
