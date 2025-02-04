const fs = require('fs');

const pagination = require('../../src/helpers/pagination');
const cache = require('../../src/helpers/cache');

let gameDataPromise;

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

function getGamesData(res, page = 1) {
    const key = `GamesData-${page}`
    const cachedData = cache.get(key);
    if (cachedData) {
        res.json(pagedResult);
        return;
    }

    _readGameData()
        .then(queryResult => {
            const pagedResult = pagination.pageResult(queryResult, page);
            cache.set(key, pagedResult);
            res.json(pagedResult);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
            console.log(err);
        });
}

function findGamesData(res, query, page = 1) {
    query = query.toLowerCase().trim();
    const key = `FindGamesData${query}-${page}}`;
    const cachedData = cache.get(key);
    if (cachedData) {
        res.json(pagedResult);
        return;
    }

    _readGameData()
        .then(queryResult => {
            const filteredResult = queryResult
                .filter(game => game.title.toLowerCase().includes(query));
            const pagedResult = pagination.pageResult(filteredResult, page);
            cache.set(key, pagedResult);
            res.json(pagedResult);
        })
        .catch(err => {
            res
                .status(500)
                .send(err);
            console.log(err);
        });
}

module.exports = { findGamesData, getGamesData };