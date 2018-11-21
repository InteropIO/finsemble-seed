const { stat } = require('fs');
const { promisify } = require('util');
const statAsync = promisify(stat);

module.exports = async (path) => {
    const exists = await statAsync(path).catch(err => undefined);
    if (exists) {
        return require(path);
    }
}