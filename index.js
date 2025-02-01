const express = require('express');
const cors = require('cors');
const fs = require('fs');

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

let gameDataPromise;

function readGameData() {
    if (!gameDataPromise) {
        gameDataPromise = new Promise((resolve, reject) => {
            fs.readFile('./data/game-data.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }
    return gameDataPromise;
}

app.get('/data/games', function (req, res) {
    readGameData()
        .then(data => res.json(data))
        .catch(err => {
            res
                .status(500)
                .send(err);
            console.log(err);
        });
});

app.post('/data/games/find', function (req, res) {
    console.log(req);
    query = req.body.query;
    if (!query || query === '') {
        res.status(400)
        res.send('Query is required');
        return;
    }
    query = query.toLowerCase();

    readGameData()
        .then(games => {
            const toReturn = games
                .filter(game => game.title.toLowerCase().includes(query));
            if (toReturn.length === 0) {
                res.status(404)
                res.send('No games found');
            } else {
                res.json(toReturn);
            }
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
            console.log(err);
        });
});

const port = process.env.PORT || 3000;

app.listen(port);