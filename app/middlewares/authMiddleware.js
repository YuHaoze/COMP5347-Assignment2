// Check if user logged in, if true: next, if false: redirect to login page
module.exports.checkCookie = (req, res, next) => {
    if(req.session && req.session.userid){

        next()
    }else{
        req.flash('warning', 'Please login your account first!');
        res.redirect('/login');
    }
}

/*
* Middleware function to check for logged-in users.
* This middleware is fired when pages are accessible by an logged-in user
*/
module.exports.authenticated = async (req, res, next) => {
    if (req.session.userid) {
        next()
    } else {
        if (req.xhr) {
            res.status(401).json({message: 'Please login first'})
        } else {
            req.flash('warning', 'Please login first')
            res.redirect('/login')
        }

    }
}

