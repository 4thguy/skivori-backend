require('dotenv').config();

const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const compression = require('compression');
const workerpool = require('workerpool');

const slots = require('./src/games/slots');

const initHelmet = require('./src/init/helmet');
const initRateLimit = require('./src/init/express-rate-limit');
const initSession = require('./src/init/express-session');
const initMorgan = require('./src/init/morgan');

const app = express();
app.set('trust proxy', 1);

// Catch errors if they bubble up to the main process
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


// Enable CORS for development only
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
    console.log("🚀 Enabling CORS for development");
    app.use(cors({
        origin: 'http://localhost:4200', // Allow Angular app during development
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
} else {
    console.log("🔒 CORS disabled in production");
}


// Middleware to parse JSON requests
app.use(express.json());
// Middleware to compress responses for better transmission
app.use(compression());

// Middleware to initialize session management
app.use(initSession());
// Middleware to initialize Helmet for security headers
app.use(initHelmet());
// Middleware to initialize rate limiting for API requests
app.use(initRateLimit());
// Middleware to initialize Morgan for logging HTTP requests
app.use(initMorgan());

// Middleware to initialize workerpool for multi-threaded tasks
const gameDataPool = workerpool.pool('./src/games/data');
/*
 * Warm up the game data cache by preloading specific pages
 */
async function warmUpGamesDatCache() {
    console.log("🔄 Warming up game data cache...");

    const pagesToPreload = [1, 2];
    for (const page of pagesToPreload) {
        try {
            await gameDataPool.exec('getGamesData', [page]);
            console.log(`✅ Cached page ${page}`);
        } catch (err) {
            console.error(`❌ Failed to cache page ${page}:`, err);
        }
    }

    console.log("🔥 Cache warm-up completed.");
}
app.get('/data/games', async (req, res) => {
    page = req.query.page || 1;

    try {
        const result = await gameDataPool.exec('getGamesData', [page]);
        res.json(result);
    } catch (err) {
        res
            .status(500)
            .send(err);
        console.error(err);
    }
});
app.post('/data/games/find', [
    body('query').isString().withMessage('Invalid query format'),
    body('query').trim().isLength({ min: 3 }).withMessage('Query too short'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    query = req.body.query.toLowerCase().trim();
    page = req.body.page || 1;

    try {
        const result = await gameDataPool.exec('findGamesData', [query, page]);
        res.json(result);
    } catch (err) {
        res
            .status(500)
            .send(err);
        console.log(err);
    }
});
warmUpGamesDatCache();

app.get('/game/slots/status', function (req, res) {
    return slots.getStatus(req, res);
});

app.post('/game/slots/spin', function (req, res) {
    return slots.spinSlots(req, res);
});

const port = process.env.PORT || 3000;

app.listen(port);