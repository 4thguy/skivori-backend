require('dotenv').config();

const pageSize = parseInt(process.env.GAME_PAGE_SIZE);

/*
 * Returns a paginated result
 * @param {Array} result - The array of items to paginate
 * @param {number} page - The current page number
 * @returns {Object} - An object containing the paginated data, page size, current page, and total pages
 */
function pageResult(result, page) {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
        data: result.slice(startIndex, endIndex),
        pageSize: pageSize,
        currentPage: page,
        totalPages: Math.ceil(result.length / pageSize)
    };
}

module.exports = { pageResult };