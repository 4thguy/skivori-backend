const _cache = {};

/*
 * Get the cached data
 * @param {string} key - The cache key
 * @returns {*} - The cached data
 */
function get(key) {
    return _cache[key];
}

/*
 * Set the cached data with a TTL (time to live)
 * @param {string} key - The cache key
 * @param {*} value - The data to cache
 * @param {number} ttl - The time to live in minutes
 */
function set(key, value, ttl = 60) {
    _cache[key] = value;
    setTimeout(() => delete _cache[key], ttl * 60 * 1000);
}

module.exports = { get, set };