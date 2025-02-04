require('dotenv').config();

const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

const games = require('./src/games/data');
const slots = require('./src/games/slots');

const initHelmet = require('./src/init/helmet');
const initRateLimit = require('./src/init/express-rate-limit');
const initSession = require('./src/init/express-session');
const initMorgan = require('./src/init/morgan');

const initWarmup = require('./src/init/warmup');

const app = express();
app.set('trust proxy', 1);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


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


app.use(express.json());

app.use(initSession());
app.use(initHelmet());
app.use(initRateLimit());
app.use(initMorgan());

initWarmup();

app.get('/data/games', function (req, res) {
    page = req.query.page || 1;
    return games.getGamesData(res, page)
});

app.post('/data/games/find', [
    body('query').isString().withMessage('Invalid query format'),
    body('query').trim().isLength({ min: 3 }).withMessage('Query too short'),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // ✅ Handles bad input
    }

    query = req.body.query.toLowerCase().trim();
    page = req.body.page || 1;

    return games.findGamesData(res, query, page);
});

app.get('/game/slots/status', function (req, res) {
    return slots.getStatus(req, res);
});

app.post('/game/slots/spin', function (req, res) {
    return slots.spinSlots(req, res);
});

const port = process.env.PORT || 3000;

app.listen(port);