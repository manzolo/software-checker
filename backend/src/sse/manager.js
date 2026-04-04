'use strict';

const clients = new Set();

function addClient(res) {
  clients.add(res);
  // Heartbeat every 30s to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': heartbeat\n\n');
    } else {
      clearInterval(heartbeat);
      clients.delete(res);
    }
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
}

function broadcast(eventName, data) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    if (!res.writableEnded) {
      res.write(payload);
    } else {
      clients.delete(res);
    }
  }
}

module.exports = { addClient, broadcast };
