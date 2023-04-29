const ws = require('ws');
const jwt = require("jsonwebtoken");

const { authJwt } = require("../middleware")
require('dotenv').config()
const { PORT, JWT_SECRET, HASH_SECRET } = process.env;
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { encrypt, decrypt } = require("../utils/encryptToken");

// Create a rate limiter to limit the number of connections per IP address
const limiter = new RateLimiterMemory({
    points: 10, // Maximum number of connections
    duration: 1, // Per second
});

const driverConnections = new Map();

const server = function (app, db) {
    const DriverLive = db.driverLive;
    const AmbulanceDriver = db.ambulanceDriver;

    const wsServer = new ws.Server({
        noServer: true,
        path: '/websocket',
    });

    // TODO: add verification for valid ambulance driver client before this is logged
    wsServer.on('connection', async (ws, req) => {
        const hash = req.url.split('=')[1];

        if (!hash) {
            ws.send(JSON.stringify({ message: 'Unauthorized' }));
            ws.close();
            return;
        }
        console.log(`WebSocket connection established for client ${req.socket.remoteAddress}`);

        // When we receive GPS data from the client, update the driver's live location in the database
        ws.on('message', async (message) => {
            // verify JWT token
            const decodedHash = decrypt(hash);
            const decodedToken = jwt.verify(decodedHash, JWT_SECRET);

            // check if the user is an ambulance driver
            try {
                const ambulanceDriver = await AmbulanceDriver.findById(decodedToken.id);
                if (!ambulanceDriver) {
                    ws.send(JSON.stringify({ message: 'Require Ambulance Role' }));
                    ws.close();
                    return;
                }

                // establish connection and store WebSocket connection for the driver
                console.log(`WebSocket connection established for driver ${ambulanceDriver.phoneNumber}`);
                driverConnections.set(ambulanceDriver.phoneNumber, ws);

                const { driverPhone, latitude, longitude } = JSON.parse(message);

                if (driverPhone == ambulanceDriver.phoneNumber) {
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
                } else {
                    throw new Error("Only allowed to updated your own location")
                }
            }
            catch (err) {
                console.error(err);

                // Send an error message to the client if JSON parsing fails
                ws.send(JSON.stringify({ error: err }));
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

module.exports = { driverConnections, server }
