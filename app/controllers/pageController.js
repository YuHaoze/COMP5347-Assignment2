
module.exports.index = function (req, res) {
    res.render('index.pug',{
        success: req.flash("success").toString(),
        username: req.session.username,
        email: req.session.email,
    })
}