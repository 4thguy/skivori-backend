const express = require('express');
const fs = require('fs');
const app = express();

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
            res.status(500);
            res.send(err);
            console.log(err);
        });
});

const port = process.env.PORT || 3000;

app.listen(port);