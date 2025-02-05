const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../logs/access.log'), { flags: 'a' });

const isDev = process.env.NODE_ENV !== 'production';

/*
 * Initializes the Morgan middleware object
 * @returns {Function} - The Morgan middleware function
 */
function initMorgan() {
    return isDev
        ? morgan('dev', {
            skip: (req, res) => res.statusCode < 400,
        })
        : morgan('short', {
            skip: (req, res) => res.statusCode < 400,
            stream: accessLogStream,
        });
}

module.exports = initMorgan;