var Revision = require('../models/revision')


module.exports.index = async (req, res, next) => {
    res.render('analytics/index', {
        username: req.session.username
    })
}

/*Overall Analytics*/
//The top two articles with the highest/lowest number of revisions and their number of revisions.
module.exports.findHighestLowestRevisions = (req, res) => {
    var numberOfTopArticles = req.query.numberOfTopArticles;
    var sortOrder = req.query.sortOrder;
    Revision.findHighestLowestRevisions(numberOfTopArticles, sortOrder).then((result) => {
        res.send(result);
    }).catch(err => {
        console.log(err.message);
    })
}

//The top two articles edited by the largest/smallest group of registered users (non bots) and their group size.
module.exports.findHighestLowestGroup = (req, res) => {
    var numberOfTopArticles = req.query.numberOfTopArticles;
    var sortOrder = req.query.sortOrder;
    Revision.findHighestLowestGroup(numberOfTopArticles, sortOrder).then((result) => {
        res.send(result);
    }).catch(err => {
        console.log(err.message);
    })
}

//The top two articles with the longest/shortest history.
module.exports.findLongestShortestHistory = (req, res) => {
    var numberOfTopArticles = req.query.numberOfTopArticles;
    var sortOrder = req.query.sortOrder;
    Revision.findLongestShortestHistory(numberOfTopArticles, sortOrder).then((result) => {
        res.send(result);
    }).catch(err => {
        console.log(err.message);
    })
}

//The revision number distribution by year and by user type across the whole dataset.
module.exports.findUserTypeByYear = (req, res) => {
    Revision.findUserTypeByYear().then((result) => {
        res.send(result);
    }).catch(err => {
        console.log(err.message);
    })
}

//The revision number distribution by user type across the whole dataset.
module.exports.findUserType = (req, res) => {
    Revision.findUserType().then((result) => {
        res.send(result);
    }).catch(err => {
        console.log(err.message);
    })

}








