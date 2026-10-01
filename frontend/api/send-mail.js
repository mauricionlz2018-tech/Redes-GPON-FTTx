const nodemailer = require('nodemailer');

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

  const { toEmail, userName, resetCode, htmlContent } = req.body || {};

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

    await transporter.sendMail({
      from: '"GPON Telecom S.A. de C.V." <nolazcomaury2004@gmail.com>',
      to: toEmail,
      subject: `Código de Seguridad (${resetCode}) - GPON Telecom`,
      text: `Hola ${userName || 'Usuario'},\n\nTu código de recuperación para GPON Telecom es: ${resetCode}\nEste código tiene una vigencia estricta de 3 minutos.\n\nSi no realizaste esta solicitud, ignora este mensaje.`,
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
