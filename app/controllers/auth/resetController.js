
const User = require('../../models/user')
const bcrypt = require('bcryptjs');
const {HASHING_SALT} = require('../../config/hashing');


module.exports.index = (req, res) => {
    res.render('auth/passwords/reset.pug', {
        success: req.flash("success").toString(),
        error: req.flash('error').toString(),
    })
}


module.exports.reset = async (req, res) => {
    // 1. get all request data
    let password = req.body.password,
        passwordConfirm = req.body.password_confirm
    const email = req.session.email;

    // 2. validate user input: same password input
    if (password.localeCompare(passwordConfirm) === 0 && email) {
        // 3. hash password
        try {
            password = await bcrypt.hashSync(password, HASHING_SALT)
            // 4. update password in database by email
            User.findOneAndUpdate({email: email}, {password: password}, {new: true, upsert: false}, function (err, data) {
                if (err) {
                    req.flash('error', 'Server internal error')
                    res.redirect('/login')
                } else {
                    req.flash('success', 'Your password has been updated, now you can login with your new password')
                    res.redirect('/login')
                }
            })
        } catch (e) {
            throw e
        }
    } else {
        // invalid password input
        req.flash('error', 'Invalid input!')
        res.redirect('/login')
    }

}





