const User = require('../../models/user')
const bcrypt= require('bcryptjs');
const {HASHING_SALT} = require('../../config/hashing');

module.exports.index = (req,res) => {
    res.render('auth/register.pug',{
        error: req.flash('error').toString(),
    });
}

module.exports.register = (req, res, next) => {

    var user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        email: req.body.email,
        answer1: req.body.answer1,
        answer2: req.body.answer2,
    });

    //hash user password
    user.password = bcrypt.hashSync(req.body.password,HASHING_SALT)

    user.save(function(err, data){
        console.log("user status:", err? 'failed':'success');
        if(err){
            console.log(err);
            req.flash("error", "Sorry, your account has already existed. Please you register again!");
            res.redirect('/register');
        }else{
            req.session.userid = data._id;
            req.session.email = data.email;
            req.session.username = data.firstname;
            req.flash("success", "Welcome, " +data.firstname);
            res.redirect('/home');
        }
    })
}



