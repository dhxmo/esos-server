const ws = require('ws');

require('dotenv').config()
const { PORT } = process.env;

module.exports = function (app, db) {
    const DriverLive = db.driverLive;
    const wsServer = new ws.Server({
        noServer: true,
        path: '/websocket',
    });

    wsServer.on('connection', (ws, _) => {
        console.log('WebSocket connection established');

        // When we receive GPS data from the client, update the driver's live location in the database
        ws.on('message', async (message) => {
            const { driverPhone, latitude, longitude } = JSON.parse(message);

            try {
                await DriverLive.findOneAndUpdate(
                    { driverPhone },
                    { location: { type: 'Point', coordinates: [longitude, latitude] } },
                    { upsert: true }
                );

                console.log(`Live location updated for driver ${driverPhone}`);
            } catch (err) {
                console.error(err);
            }
        });
    });

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        });
    });

    return server;
};
