require('dotenv').config();

const expressSession = require('express-session');

function initSession() {
    return expressSession({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,  // ✅ Set to `true` only if using HTTPS
            maxAge: 1000 * 60 * 60 * 24, // ✅ 24-hour session persistence
            httpOnly: true
        }
    })
}

module.exports = initSession;