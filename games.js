const fs = require('fs');

let gameDataPromise;

module.exports = { findGamesData, getGamesData };

function _readGameData() {
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

function getGamesData(res) {
    _readGameData()
        .then(data => res.json(data))
        .catch(err => {
            res
                .status(500)
                .send(err);
            console.log(err);
        });
}

function findGamesData(res, query) {
    _readGameData()
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
}