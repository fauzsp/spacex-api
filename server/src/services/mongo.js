const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;

mongoose.connection.once("open", () => console.log(`connections started ${PORT}`));
const MONGO_URL = process.env.MONGO_URL

mongoose.connection.on("error", (err) => console.log("error connecting to server", err));

async function mongoConnect() {
   await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true, useUnifiedTopology: true
    })
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {mongoConnect, mongoDisconnect}