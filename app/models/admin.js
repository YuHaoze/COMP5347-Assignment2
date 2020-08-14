const mongoose = require('mongoose')

const collectionName = 'admins';

const schema = {
    name: {
        type: String,
        unique: true,
        required: true,
    }
}

const AdminSchema = new mongoose.Schema(schema)
module.exports = mongoose.model(collectionName,AdminSchema)