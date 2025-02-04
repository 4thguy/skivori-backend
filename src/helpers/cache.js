const _cache = {};

function get(key) {
    return _cache[key];
}

function set(key, value, ttl) {
    _cache[key] = value;
    setTimeout(() => delete _cache[key], ttl * 60 * 1000);
}

module.exports = { get, set };