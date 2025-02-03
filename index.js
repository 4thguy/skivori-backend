const express = require('express');
const cors = require('cors');

const games = require('./games');

const app = express();
app.use(express.json());

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

const port = process.env.PORT || 3000;

app.listen(port);