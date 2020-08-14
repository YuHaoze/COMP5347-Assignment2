const dotenv = require('dotenv');
dotenv.config();

module.exports = (env_key, default_value) => {
    return process.env[env_key] ? process.env[env_key] : default_value;
}
