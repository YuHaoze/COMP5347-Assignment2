const env = require('./env')

module.exports = {
    HASHING_SALT: parseInt(env('HASHING_SALT', 10))
}