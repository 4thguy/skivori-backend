require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const cors = require('cors');

const games = require('./src/games/data');
const slots = require('./src/games/slots');

const initHelmet = require('./src/init/helmet');
const initRateLimit = require('./src/init/express-rate-limit');
const initMorgan = require('./src/init/morgan');

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

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // ✅ Set to `true` only if using HTTPS
        maxAge: 1000 * 60 * 60 * 24, // ✅ 24-hour session persistence
        httpOnly: true
    }
}));


app.use(express.json());

app.use(initHelmet());
app.use(initRateLimit());
app.use(initMorgan());

app.get('/data/games', function (req, res) {
    return games.getGamesData(res)
});

app.post('/data/games/find', [
    body('query').isString().withMessage('Invalid query format'),
    body('query').trim().isLength({ min: 3 }).withMessage('Query too short'),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // ✅ Handles bad input
    }

    query = req.body.query;
    query = query.toLowerCase();

    return games.findGamesData(res, query);
});

app.get('/game/slots/status', function (req, res) {
    return slots.getStatus(req, res);
});

app.post('/game/slots/spin', function (req, res) {
    return slots.spinSlots(req, res);
});

const port = process.env.PORT || 3000;

app.listen(port);