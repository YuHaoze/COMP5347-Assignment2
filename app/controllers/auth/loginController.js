const User = require('../../models/user')
const bcrypt= require('bcryptjs');
const {HASHING_SALT} = require('../../config/hashing');

module.exports.index = (req, res) =>  {
    res.render('auth/login.pug',{
    error: req.flash('error').toString(),
    success: req.flash('success').toString(),
    warning: req.flash('warning').toString(),
    });
}

module.exports.login = (req, res, next) => {
   let email = req.body.email;
   let password = req.body.password;
   let username = req.body.firstname;

   User.findOne({'email':email}, (err,data) => {
      //  console.log(data.password);
       if(err){
         //server error, redirect to login
           req.flash("error", "server internal error!");
           res.redirect("/login");
       }
       if(data){
         //find the user, user found by username
          let userPassword = data.password;
         /**
         * Validate input password with user's password
         */
          if(bcrypt.compareSync(password, userPassword)){
            //password matched, user is authorised, log user in

            //store user id
            req.session.userid = data._id;
            req.session.username = data.firstname;
            req.session.email = data.email;

            req.flash("success", "Welcome! "+ data.firstname);
            res.redirect('/home');
          }else{
            //incorrect password, redirect user back to the login page
            req.flash("error", "Unmatched user password!");
            res.redirect("/login");
          }
       }else{
         //unmatched username, failed to find user, redirect user back to the login page
         req.flash("error", "Unmatched user account or password!");
         res.redirect("/login");
       }
  });
}


module.exports.logout = (req,res) =>{
    req.session.destroy(function(err){
      if(err){
        res.redirect('back');
      }else{
          res.redirect("/home");
      }
    })
}





