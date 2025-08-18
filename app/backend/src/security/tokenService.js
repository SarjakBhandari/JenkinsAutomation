// src/security/tokenService.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

module.exports = { generateToken };