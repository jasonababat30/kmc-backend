require('dotenv').config()

const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

const userRoutes = require('./routes/users');

const {
    DATABASE_URL,
    SERVER_PORT
} = process.env;

app.use(
    cors({
        origin: "*"
    })
)

mongoose.connect(DATABASE_URL)

const db = mongoose.connection;
db.on('error', (error) => {
    console.error(`⚖️ DB Connection Error`, error);
});
db.once('open', () => {
    console.info(`🚀 Server Connected to Database`);
})

app.use(express.json());

/* ROUTES */
app.use('/users', userRoutes);

app.listen(SERVER_PORT, () => console.info(`🐶 Server Running at "${SERVER_PORT}"`))