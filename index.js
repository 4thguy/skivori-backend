require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');

const games = require('./games');
const slots = require('./slots');

const app = express();
app.set('trust proxy', 1);

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

app.get('/data/games', function (req, res) {
    return games.getGamesData(res)
});

app.post('/data/games/find', function (req, res) {
    query = req.body.query;
    if (!query || query === '') {
        res.status(400)
        res.send('Query is required');
        return;
    }
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