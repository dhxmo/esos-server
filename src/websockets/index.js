const ws = require('ws');
require('dotenv').config();
const { PORT } = process.env;
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { handleDriverLiveUpdate } = require('../services/websocket.service');

// Create a rate limiter to limit the number of connections per IP address
const limiter = new RateLimiterMemory({
  points: 10, // Maximum number of connections
  duration: 1, // Per second
});

exports.server = (app) => {
  const wsServer = new ws.Server({
    noServer: true,
    path: '/websocket',
  });

  wsServer.on('connection', async (ws, req) => {
    const hash = req.url.split('=')[1];

    if (!hash) {
      ws.send(JSON.stringify({ message: 'Unauthorized' }));
      ws.close();
      return;
    }
    console.log(
      `WebSocket connection established for client ${req.socket.remoteAddress}`
    );

    // When we receive GPS data from the client, update the driver's live location in the database
    ws.on('message', async (message) => {
      const { type, ...data } = JSON.parse(message);

      switch (type) {
        case 'locationUpdate':
          await handleDriverLiveUpdate(data, ws, hash);
          break;
        default:
          console.error(`Unknown message type \${type}`);
          break;
      }
    });

    // When the WebSocket connection is closed, log the event
    // TODO: delete driver and patient connections from map on connection close
    ws.on('close', (code, reason) => {
      console.log(
        `WebSocket connection closed for client ${req.socket.remoteAddress}: code=${code}, reason=${reason}`
      );
    });
  });

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('upgrade', (request, socket, head) => {
    limiter
      .consume(request.socket.remoteAddress)
      .then(() => {
        wsServer.handleUpgrade(request, socket, head, (socket) => {
          wsServer.emit('connection', socket, request);
        });
      })
      .catch((rejRes) => {
        // If the limit is exceeded, reject the WebSocket connection
        socket.write(
          `HTTP/1.1 429 Too Many Requests\r\nContent-Length: ${
            rejRes.msBeforeNext
          }\r\nRetry-After: ${Math.ceil(rejRes.msBeforeNext / 1000)}\r\n\r\n`
        );
        socket.destroy();
      });
  });

  wsServer.on('close', () => {
    console.log('WebSocket server closed');
  });

  wsServer.on('error', (err) => {
    console.error(`WebSocket server error: ${err}`);
  });

  return server;
};
