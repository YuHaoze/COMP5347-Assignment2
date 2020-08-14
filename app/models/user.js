var mongoose = require('mongoose')
const Schema = mongoose.Schema;

var userSchema = new Schema({
    firstname:{
        type: String,
        required: true,
    },
    lastname: {
        type : String,
        required:true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
    },
    answer1 :{
        type: String,
        minlength: 3,
        maxlength: 20,
    },
    answer2:{
        type: String,
        minlength: 3,
        maxlength: 20,
    },
});


module.exports = mongoose.model('User', userSchema)
