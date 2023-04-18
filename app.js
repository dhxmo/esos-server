const express = require("express");
const app = express();

const requestRoutes = require("./routes/emergency.routes");

const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/emergency-services', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

//middleware
app.use(express.json());

app.use("/api/requests", requestRoutes);

app.listen(8080, () => {
    console.log("Server is running on port 3001");
});

module.exports = app;
