var mongoose = require('../../models/user')
var User = mongoose.model('User')

var index = function (req, res) {

    res.render('auth/passwords/forgot-pwd.pug', {
        error: req.flash('error').toString()
    })
}

var validate = (req, res) => {
    let email = req.body.email;
    let answer1 = req.body.answer1;
    let answer2 = req.body.answer2;


    User.findOne({ email: email, answer1: answer1, answer2: answer2 }, (err, data) => {

        if (err) {
            //server error, redirect to login
            req.flash("error", "server internal error!");
            res.redirect("/login");

        }
        if(data) {
            // matched data
            // TODO: redirect to/render pwd reset page
            req.flash('success', 'You are authenticated. Please type your new password')
            req.session.email = data.email
            res.redirect('/reset')
        } else{
            // data unmatched
            // Flash error, redirect to forgot-pwd page
            req.flash('error', 'Failed to match your security answers with any user')
            res.redirect('/forgot-pwd')

        }
    })

}

module.exports.index = index
module.exports.validate = validate



