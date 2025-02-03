const expressRateLimit = require('express-rate-limit');

function initRateLimit() {
    return expressRateLimit({
        windowMs: 15 * 60 * 1000, // ✅ 15 minutes
        max: 100, // ✅ Limit each IP to 100 requests per window
        message: 'Too many requests, please try again later.',
    });
}

module.exports = initRateLimit;