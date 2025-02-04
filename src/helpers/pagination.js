require('dotenv').config();

const pageSize = parseInt(process.env.GAME_PAGE_SIZE);

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