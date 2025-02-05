const expressRateLimit = require('express-rate-limit');

/*
 * Initializes the rate limit middleware object
 * @returns {Function} - The rate limit middleware function
 */
function initRateLimit() {
    return expressRateLimit({
        windowMs: 15 * 60 * 1000, // ✅ 15 minutes
        max: 100, // ✅ Limit each IP to 100 requests per window
        message: 'Too many requests, please try again later.',
    });
}

module.exports = initRateLimit;