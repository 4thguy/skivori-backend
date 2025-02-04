const fs = require('fs');
const workerpool = require('workerpool');

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

async function getGamesData(page = 1) {
    const key = `GamesData-${page}`;
    const cachedData = cache.get(key);

    if (cachedData) {
        return cachedData; // Return cached data if available
    }

    try {
        const queryResult = await _readGameData();
        const pagedResult = pagination.pageResult(queryResult, page);
        cache.set(key, pagedResult);
        return pagedResult;
    } catch (err) {
        throw new Error("Failed to retrieve game data: " + err.message);
    }
}

async function findGamesData(query, page = 1) {
    query = query.toLowerCase().trim();
    const key = `FindGamesData-${query}-${page}`;

    const cachedData = cache.get(key);
    if (cachedData) {
        return cachedData;
    }

    try {
        const queryResult = await _readGameData();
        const filteredResult = queryResult.filter(game =>
            game.title.toLowerCase().includes(query)
        );

        const pagedResult = pagination.pageResult(filteredResult, page);
        cache.set(key, pagedResult);
        return pagedResult;
    } catch (err) {
        throw new Error("Failed to search games: " + err.message);
    }
}

// Register functions for worker pool
workerpool.worker({
    getGamesData,
    findGamesData
});
