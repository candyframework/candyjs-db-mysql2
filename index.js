const Db = require('./src/index');
const Query = require('./src/Query');

module.exports = Db.default;
module.exports.Query = Query.default;
