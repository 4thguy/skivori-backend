const { forkJoin } = require('rxjs');

const fs = require('fs');

let slotDataPromise;
let slotPayoutDataPromise;

module.exports = {
    getStatus,
    spinSlots,
};

_result = ['cherry', 'cherry', 'cherry']

/*
 * Function to read the reels data from a JSON file
 * @returns {Promise} A promise that resolves to the reels data
 */
function _readSlotsData() {
    if (!slotDataPromise) {
        slotDataPromise = new Promise((resolve, reject) => {
            fs.readFile('./data/slots/reels.json', 'utf8', (err, data) => {
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
    return slotDataPromise;
}

/*
 * Function to read the payouts data from a JSON file
 * @returns {Promise} A promise that resolves to the payouts data
 */
function _readSlotsPayoutData() {
    if (!slotPayoutDataPromise) {
        slotPayoutDataPromise = new Promise((resolve, reject) => {
            fs.readFile('./data/slots/payouts.json', 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    let payoutTable = JSON.parse(data);
                    payoutTable.sort((a, b) => b.consecutive - a.consecutive);
                    resolve(payoutTable);
                } catch (parseError) {
                    reject(parseError);
                }
            });
        });
    }
    return slotPayoutDataPromise;
}

/*
 * Function to check the payout for a given type and consecutive occurrences
 * @param payouts {Array} - The array of payout objects
 * @param type {String} - The type of payout to check
 * @param consecutive {Number} - The number of consecutive occurrences
 * @returns {Number} - The payout amount or 0 if not found
 */
function _checkPayout(payouts, type, consecutive) {
    return payouts.find(payout => payout.consecutive === consecutive && payout.type === type)?.payout || 0;
}

/*
 * Function to calculate the payout based on the slot results
 * @param result {Array} - The array of slot results
 * @param payouts {Array} - The array of payout objects
 * @returns {Number} - The calculated payout amount or 0 if not found
 */
function _calculatePayout(result, payouts) {
    if (result[0] === result[1] && result[1] === result[2]) {
        return _checkPayout(payouts, result[0], 3);
    }
    if (result[0] === result[1] || result[1] === result[2]) {
        return _checkPayout(payouts, result[1], 2);
    }
    return 0
}

/*
 * Function to get the result of the slot machine
 * @param req {Object} - The request object containing session data
 * @returns {Array} - The result of the slot machine
 */
function _getResult(req) {
    req.session.slotResult = req.session.slotResult || [..._result];
    return req.session.slotResult;
}

/*
 * Function to set the result of the slot machine
 * @param req {Object} - The request object containing session data
 * @param result {Array} - The result of the slot machine
 */
function _setResult(req, result) {
    req.session.slotResult = result;
}

/*
 * Function to get the credit of the slot machine
 * @param req {Object} - The request object containing session data
 * @returns {Number} - The credit of the slot machine
 */
function _getCredit(req) {
    req.session.slotCredit = req.session.slotCredit || 20;
    return req.session.slotCredit;
}

/*
 * Function to use the credit of the slot machine
 * @param req {Object} - The request object containing session data
 */
function _useCredit(req) {
    if (_getCredit(req) < 1) {
        throw new Error("Not enough credit to spin the slot machine");
    }

    req.session.slotCredit = _getCredit(req) - 1;
}

/*
 * Function to add credit to the slot machine
 * @param req {Object} - The request object containing session data
 * @param amount {Number} - The amount of credit to add
 */
function _addCredit(req, amount) {
    req.session.slotCredit = _getCredit(req) + amount;
}

/*
 * Function to get the status of the slot machine
 * @param req {Object} - The request object containing session data
 * @param res {Object} - The response object
 */
function getStatus(req, res) {
    res.json({
        result: _getResult(req),
        payout: 0,
        credits: _getCredit(req),
    });
}

/*
 * Function to spin the slot machine and get the result
 * @param req {Object} - The request object containing session data
 * @param res {Object} - The response object
 */
function spinSlots(req, res) {
    const credit = _getCredit(req);
    if (credit < 1) {
        return res.status(400).json({ error: 'Not enough credit to spin the slot machine' });
    }
    try {
        _useCredit(req);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    const fork = forkJoin([_readSlotsData(), _readSlotsPayoutData()])
    fork
        .subscribe(([reels, payouts]) => {
            const result = reels.map(arr => arr[Math.floor(Math.random() * arr.length)]);
            const payout = _calculatePayout(result, payouts);
            _addCredit(req, payout);
            _setResult(req, result);
            res.json({
                result,
                payout,
                credits: _getCredit(req),
            });
        },
            (error) => {
                console.error(error);
                res.status(500).send('Error reading slots data');
            }
        );
}
