// src/config/config.js
require('dotenv').config();

const config = {
    db: {
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        dialect: 'postgres',
    },
    jwt: {
        secret: process.env.SECRET_KEY,
        expiresIn: process.env.EXPIRES_IN,
    },
};

module.exports = config;