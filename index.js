const Db = require('./src/index');
const Query = require('./src/Query');
const Command = require('./src/Command');

module.exports = Db.default;
module.exports.Query = Query.default;
module.exports.Command = Command.default;
