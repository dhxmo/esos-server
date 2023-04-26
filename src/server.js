const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieSession = require("cookie-session");
require('dotenv').config()
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/user.routes');
const emergencyRoutes = require("./routes/emergency.routes");
const ws = require('ws');

const { PORT, MONGODB_URI, COOKIE_SECRET } = process.env;

const db = require("./models");
const DriverLive = db.driverLive;

const app = express();
const wsServer = new ws.Server({
    noServer: true,
    path: "/websocket",
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

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

//middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        name: "emergency-service-session",
        secret: `${COOKIE_SECRET}`,
        httpOnly: true
    })
);

// DB
mongoose.connect(`${MONGODB_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Successfully connect to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

app.get("/healthcheck", (_, res) => {
    res.json({ message: "Health is good" });
});

// add routes to app
authRoutes(app);
testRoutes(app);
emergencyRoutes(app);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

module.exports = server;