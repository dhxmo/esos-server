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


var corsOptions = {
    origin: `${host}:${port}`
};

//middleware

// parse requests of content-type - application/json
app.use(express.json());
// use cors
app.use(cors(corsOptions));
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        name: "emeregency-service-session",
        secret: `${COOKIE_SECRET}`,
        httpOnly: true
    })
);

app.use("/api/requests", requestRoutes);
app.get("/healthcheck", (req, res) => {
    res.json({ message: "Health is good" });
});


// DB
mongoose.connect(`${MONGODB_URI}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// create roles in db
function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "ambulance"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'ambulance' to roles collection");
            });

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }

                console.log("added 'admin' to roles collection");
            });
        }
    });
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
