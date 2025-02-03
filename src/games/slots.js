const { forkJoin } = require('rxjs');

const fs = require('fs');

let slotDataPromise;
let slotPayoutDataPromise;

module.exports = {
    getStatus,
    spinSlots,
};

_result = ['cherry', 'cherry', 'cherry']

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

function _checkPayout(payouts, type, consecutive) {
    return payouts.find(payout => payout.consecutive === consecutive && payout.type === type)?.payout || 0;
}

function _calculatePayout(result, payouts) {
    if (result[0] === result[1] && result[1] === result[2]) {
        return _checkPayout(payouts, result[0], 3);
    }
    if (result[0] === result[1] || result[1] === result[2]) {
        return _checkPayout(payouts, result[1], 2);
    }
    return 0
}

function _getResult(req) {
    req.session.slotResult = req.session.slotResult || [..._result];
    return req.session.slotResult;
}

function _setResult(req, result) {
    req.session.slotResult = result;
}

function _getCredit(req) {
    req.session.slotCredit = req.session.slotCredit || 20;
    return req.session.slotCredit;
}

function _useCredit(req) {
    if (_getCredit(req) < 1) {
        throw new Error("Not enough credit to spin the slot machine");
    }

    req.session.slotCredit = _getCredit(req) - 1;
}

function _addCredit(req, amount) {
    req.session.slotCredit = _getCredit(req) + amount;
}

function getStatus(req, res) {
    res.json({
        result: _getResult(req),
        payout: 0,
        credits: _getCredit(req),
    });
}

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
