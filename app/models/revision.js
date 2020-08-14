var mongoose = require('mongoose');
var fs = require('fs');
var Promise = require('bluebird');
Promise.promisifyAll(fs);

var RevisionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user: String,
    timestamp: Date,
    // anon: {
    //     type: Boolean,
    //     // default: false
    // },
    anon: String,
    userType: String,
}, {
    versionKey: false
});

/**
 * Overall Analytics
 */
//The top two articles with the highest/lowest number of revisions and their number of revisions.
RevisionSchema.statics.findHighestLowestRevisions = function (numberOfTopArticles, sortOrder, callback) {
    var highLowRevisionPipeline = [
        {"$group": {"_id": "$title", "sumRevisions": {$sum: 1}}},
        {"$sort": {sumRevisions: parseInt(sortOrder)}},
        {"$limit": parseInt(numberOfTopArticles)}
    ];

    return this.aggregate(highLowRevisionPipeline).exec(callback);
}


//The top two articles edited by the largest/smallest group of registered users (non bots) and their group size.
RevisionSchema.statics.findHighestLowestGroup = function (numberOfTopArticles, sortOrder, callback) {
    var highLowGroupPipeline = [
        {"$match": {$or: [{"userType": "admin"}, {"userType": "regular"}]}},
        {"$group": {"_id": "$title", uniqueUsers: {$addToSet: "$user"}, "sumRevisions": {$sum: 1}}},
        {$unwind: "$uniqueUsers"},
        {"$group": {"_id": "$_id", "sumUsers": {$sum: 1}}},
        {"$sort": {sumUsers: parseInt(sortOrder)}},
        {"$limit": parseInt(numberOfTopArticles)}
    ];
    return this.aggregate(highLowGroupPipeline).exec(callback);
}

//The top two articles with the longest/shortest history.
RevisionSchema.statics.findLongestShortestHistory = function (numberOfTopArticles, sortOrder, callback) {
    var historyPipeline = [
        {$group: {_id: "$title", "creationTime": {$min: "$timestamp"}}},
        {$sort: {creationTime: parseInt(sortOrder)}},
        {$limit: parseInt(numberOfTopArticles)}
    ];
    return this.aggregate(historyPipeline).exec(callback);
}

//The revision number distribution by year and by user type across the whole dataset.
RevisionSchema.statics.findUserTypeByYear = function (callback) {
    var userTypeByYearPipeline = [
        {$project: {userType: 1, year: {$substr: ["$timestamp", 0, 4]}}},
        {$group: {_id: {userType: "$userType", year: "$year"}, total: {$sum: 1}}},
        {$project: {userType: '$_id.userType', year: '$_id.year', total: '$total', _id: 0}},
        {$sort: {year: 1}}
    ];
    return this.aggregate(userTypeByYearPipeline).exec(callback);
}

//The revision number distribution by user type across the whole dataset.
RevisionSchema.statics.findUserType = function (callback) {
    var userTypePipeline = [
        {$group: {_id: {userType: "$userType"}, total: {$sum: 1}}},
    ];
    return this.aggregate(userTypePipeline).exec(callback);
}


//get Author names
RevisionSchema.statics.findAllAuthorNames = function (callback) {
    return this.find({anon: 'false'}).distinct('user', function (err, data) {
        if (err) {
            throw err
        }
        callback(data);
    });
}

/**
 * Individual Analytics
 */
//define the findTotalTitle functionality
RevisionSchema.statics.findTotalTitles = (callback) => {
    return this.aggregate([{
        $group: {
            _id: "$title",
            total: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            total: -1
        }
    }
    ]).exec(callback)
}

//get the top 5 regular users ranked by total revision numbers
RevisionSchema.statics.getIndividualTitleInfo = (userInput, callback) => {
    return this.aggregate([{
        $match: {
            "title": userInput
        }
    },
    {
        $group: {
            _id: "$user",
            total: {
                $sum: 1
            }
        }
    },
    {
        $sort: {
            total: -1
        }
    },
    {
        $limit: 5
    }
    ]).exec(callback)
}



module.exports = mongoose.model('Revision', RevisionSchema, 'revisions')

