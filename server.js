const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookieSession = require("cookie-session");

const requestRoutes = require("./routes/emergency.routes");
const db = require("./models");
const Role = db.role;

require('dotenv').config()
const { host, port, MONGODB_URI, COOKIE_SECRET } = process.env;

const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/user.routes');
const emergencyRoutes = require("./routes/emergency.routes");


var corsOptions = {
    origin: `${host}:${port}`
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

// app.use("/api/requests", requestRoutes);
app.get("/healthcheck", (req, res) => {
    res.json({ message: "Health is good" });
});


// DB
mongoose.connect(`${MONGODB_URI}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// create roles in db
async function initial() {
    try {
        const count = await Role.estimatedDocumentCount();
        if (count === 0) {
            await Promise.all([
                new Role({
                    name: "user"
                }).save(),

                new Role({
                    name: "ambulance"
                }).save(),

                new Role({
                    name: "admin"
                }).save()
            ]);
            console.log("Added roles to roles collection");
        }
    } catch (err) {
        console.error("Error initializing roles", err);
    }
}

// add routes to app
authRoutes(app);
testRoutes(app);
emergencyRoutes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
