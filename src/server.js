const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieSession = require("cookie-session");
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/user.routes');
const emergencyRoutes = require("./routes/emergency.routes");
const { server } = require('./websockets')

require('dotenv').config()
const { MONGODB_URI, COOKIE_SECRET } = process.env;

const db = require("./models");

const app = express();

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

const { websocketServer, _ } = server(app, db);

module.exports = websocketServer;