const mongoose = require('mongoose');

const collectionName = 'bots'

const schema = {
    name: {
        type: String,
        unique: true,
        required: true,
    },
}

const BotSchema = new mongoose.Schema(schema)
module.exports = mongoose.model(collectionName,BotSchema)