const ws = require('ws');

require('dotenv').config()
const { PORT } = process.env;
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Create a rate limiter to limit the number of connections per IP address
const limiter = new RateLimiterMemory({
    points: 10, // Maximum number of connections
    duration: 1, // Per second
});

module.exports = function (app, db) {
    const DriverLive = db.driverLive;
    const AmbulanceDriver = db.ambulanceDriver;

    const wsServer = new ws.Server({
        noServer: true,
        path: '/websocket',
    });

    // TODO: add verification for valid ambulance driver client before this is logged
    wsServer.on('connection', async (ws, req) => {
        console.log(`WebSocket connection established for client ${req.socket.remoteAddress}`);

        // When we receive GPS data from the client, update the driver's live location in the database
        ws.on('message', async (message) => {
            try {
                const { driverPhone, latitude, longitude } = JSON.parse(message);
                const driver = await AmbulanceDriver.findOne({ phoneNumber: driverPhone });

                if (!driver) {
                    throw new Error("Driver not registered")
                }
                await DriverLive.findOneAndUpdate(
                    { driverPhone },
                    {
                        location: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                    },
                );

                console.log(`Live location updated for driver ${driverPhone}`);
            } catch (err) {
                console.error(err);

                // Send an error message to the client if JSON parsing fails
                ws.send(JSON.stringify({ error: 'Invalid message format' }));
            }
        });

        // When the WebSocket connection is closed, log the event
        ws.on('close', (code, reason) => {
            console.log(`WebSocket connection closed for client ${req.socket.remoteAddress}: code=${code}, reason=${reason}`);
        });
    });

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('upgrade', (request, socket, head) => {
        limiter.consume(request.socket.remoteAddress)
            .then(() => {
                wsServer.handleUpgrade(request, socket, head, socket => {
                    wsServer.emit('connection', socket, request);
                });
            })
            .catch((rejRes) => {
                // If the limit is exceeded, reject the WebSocket connection
                socket.write(`HTTP/1.1 429 Too Many Requests\r\nContent-Length: ${rejRes.msBeforeNext}\r\nRetry-After: ${Math.ceil(rejRes.msBeforeNext / 1000)}\r\n\r\n`);
                socket.destroy();
            });
    });

    wsServer.on('close', () => {
        console.log('WebSocket server closed');
    });

    wsServer.on('error', (err) => {
        console.error(`WebSocket server error: ${err}`);
    });

    return server
};
