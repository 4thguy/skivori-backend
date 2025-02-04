const gamesData = require('../../src/games/data');

const _dummyRes = {
    status: (data) => {
        console.log(`Status ${data} returned.`);
        return _dummyRes;
    },
    json: (data) => {
        console.log(`JSON data returned.`);
        return _dummyRes;
    },
    send: (data) => {
        console.log(`Send data returned.`);
        return _dummyRes;
    },

};

function initWarmup() {
    console.log("Warming up...");
    gamesData.getGamesData(_dummyRes, 1);
}

module.exports = initWarmup;