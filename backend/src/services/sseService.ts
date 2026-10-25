import { Response } from 'express';

// Conjunto de clientes SSE conectados en tiempo real
const clients = new Set<Response>();

/**
 * Registra una nueva conexión SSE (Server-Sent Events)
 */
export const registerSseClient = (res: Response) => {
  clients.add(res);
  console.log(`📡 [SSE] Nuevo cliente conectado. Total conectados: ${clients.size}`);

  // Enviar mensaje de bienvenida inicial
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  // Limpieza al cerrar la conexión
  res.on('close', () => {
    clients.delete(res);
    console.log(`🔌 [SSE] Cliente desconectado. Total conectados: ${clients.size}`);
  });
};

/**
 * Transmite una notificación de cambio de red a todos los dispositivos conectados (Mac, Windows, Android, etc.)
 */
export const broadcastNetworkChange = (eventType: string, payload?: any) => {
  const message = `data: ${JSON.stringify({
    type: eventType,
    payload,
    timestamp: Date.now()
  })}\n\n`;

  let sent = 0;
  for (const client of clients) {
    try {
      client.write(message);
      sent++;
    } catch (err) {
      clients.delete(client);
    }
  }

  console.log(`⚡ [SSE Broadcast] Evento '${eventType}' transmitido a ${sent} dispositivo(s).`);
};

// Ping de mantenimiento de conexión (Keep-Alive) cada 25 segundos para evitar timeouts de proxies
setInterval(() => {
  for (const client of clients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      clients.delete(client);
    }
  }
}, 25000);

