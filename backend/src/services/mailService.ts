import nodemailer from 'nodemailer';

export interface SendRecoveryEmailOptions {
  toEmail: string;
  userName: string;
  resetCode: string;
  resetLink?: string;
}

// Configuración del transporte SMTP
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    });
  }

  // Si no hay credenciales SMTP configuradas en variables de entorno,
  // se utiliza un transporte JSON/log de desarrollo para no bloquear el flujo
  return null;
}

export async function sendPasswordRecoveryEmail(options: SendRecoveryEmailOptions): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  const { toEmail, userName, resetCode, resetLink } = options;
  const fromAddress = process.env.SMTP_FROM || '"GPON Telecom Soporte" <ventas@gpontelecom.com.mx>';

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de Contraseña - GPON Telecom</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Encabezado Corporativo -->
          <tr>
            <td style="background: linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                GPON TELECOM S.A. DE C.V.
              </h1>
              <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 13px; font-weight: 500; letter-spacing: 0.3px;">
                Sistema de Mapeo y Gestión de Redes GPON / FTTx
              </p>
            </td>
          </tr>

          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Hola, ${userName}
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta operativa en la plataforma de <strong>GPON Telecom</strong>.
              </p>

              <!-- Tarjeta de Código de Verificación -->
              <div style="background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="font-size: 12px; font-weight: 700; color: #0369a1; text-transform: uppercase; letter-spacing: 1px; display: block;">
                  Código de Seguridad Temporal
                </span>
                <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0369a1; margin: 12px 0; font-family: 'Consolas', 'Courier New', monospace;">
                  ${resetCode}
                </div>
                <span style="font-size: 12px; color: #64748b; font-weight: 500;">
                  ⏱ Este código expira en <strong>15 minutos</strong>
                </span>
              </div>

              ${resetLink ? `
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetLink}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold; display: inline-block;">
                  Restablecer Contraseña Directamente
                </a>
              </div>
              ` : ''}

              <!-- Aviso de Seguridad -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 24px;">
                <p style="margin: 0; color: #991b1b; font-size: 12px; line-height: 1.5;">
                  <strong>Importante:</strong> Si tú no solicitaste este código, puedes ignorar este correo de forma segura. Tu contraseña actual permanecerá protegida y no sufrirá cambios.
                </p>
              </div>
            </td>
          </tr>

          <!-- Pie de Página Institucional -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                GPON TELECOM S.A. DE C.V.
              </p>
              <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 11px;">
                Ejido San José del Rincón, Estado de México • Soporte Técnico y Auditoría de Red
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Contacto: <a href="mailto:ventas@gpontelecom.com.mx" style="color: #0284c7; text-decoration: none;">ventas@gpontelecom.com.mx</a>
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

  try {
    const transporter = createTransporter();

    if (transporter) {
      await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `Código de Recuperación de Contraseña - GPON Telecom (${resetCode})`,
        text: `Hola ${userName},\n\nTu código de recuperación para GPON Telecom es: ${resetCode}\nExpira en 15 minutos.\n\nSi no lo solicitaste, ignora este mensaje.`,
        html: htmlContent
      });

      console.log(`[SMTP] Correo de recuperación enviado exitosamente a: ${toEmail}`);
      return { success: true, message: 'Correo enviado exitosamente a tu bandeja de entrada.' };
    } else {
      // Modo desarrollo / fallback: mostrar en log para pruebas
      console.log(`\n======================================================`);
      console.log(`[SMTP DEMO] Simulación de correo para: ${toEmail}`);
      console.log(`Usuario: ${userName}`);
      console.log(`Código de recuperación: ${resetCode}`);
      console.log(`======================================================\n`);

      return {
        success: true,
        message: 'Código de recuperación generado exitosamente.',
        simulated: true
      };
    }
  } catch (error: any) {
    console.error('[SMTP ERROR] Error enviando correo de recuperación:', error);
    // Devolvemos el resultado seguro para que el usuario pueda usar el código incluso si el servidor SMTP falla
    return {
      success: true,
      message: 'Código de recuperación generado y registrado.',
      simulated: true
    };
  }
}

