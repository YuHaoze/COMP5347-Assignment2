const request = require('request-promise')
const isIp = require('is-ip')
const Revision = require('../models/revision')
const Bot = require('../models/bot')
const Admin = require('../models/admin')


/**
 * Find all available articles with their title and the number of revisions.
 *
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findArticlesWithTitleAndRevisionCount = async () => {
    try {
        return await Revision.aggregate([
            {
                $group: {
                    _id: '$title',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find the latest revision timestamp of an article.
 *
 * @param {string} article - The article title.
 * @return {Promise} - Resolve the latest timestamp if succeed, reject error if fail.
 */
const findLatestTimestamp = async (article) => {
    try {
        const latestRevision = await Revision.findOne({title: article}).sort({timestamp: -1}).select('timestamp')
        return latestRevision.timestamp
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Update an article revisions in the database to the latest one.
 *
 * @param {string} article - Article name.
 * @param {string} startTime - The start time to update. The time is in ISO timestamp format.
 *
 * @return {Promise} Resolve the number of revisions updated s succeed, reject error if fail.
 */
const updateRevisions = async (article, startTime) => {
    // build API query url.
    const wikiEndpoint = "https://en.wikipedia.org/w/api.php";
    const parameters = [
        "titles=" + article,
        "rvstart=" + startTime,
        "rvdir=newer",
        "action=query",
        "prop=revisions",
        "rvlimit=500",
        "rvprop=user|timestamp",
        "formatversion=2",
        "format=json"
    ]
    const url = wikiEndpoint + "?" + parameters.join("&");
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    };

    try {
        // search for new revisions
        const data = await request(options)
        const json = JSON.parse(data);
        const revisions = json.query.pages[0].revisions;

        // if find new revisions, save them into database and return the number of new revisions.
        if (revisions.length > 1) {
            const bots = await Bot.distinct('name'),
                admins = await Admin.distinct('name')
            let newRevisions = []
            for (let revision of revisions) {
                let newRevision = new Revision({
                    title: article,
                    user: revision.user,
                    timestamp: revision.timestamp,
                    anon: isIp(revision.user)
                })
                if (isIp(revision.user)) {
                    newRevision.userType = 'anonymous'
                } else if (bots.indexOf(revision.user) > -1) {
                    newRevision.userType = 'bot'
                } else if (admins.indexOf(revision.user) > -1) {
                    newRevision.userType = 'admin'
                } else {
                    newRevision.userType = 'regular'
                }
                newRevisions.push(newRevision)
            }

            await Revision.insertMany(newRevisions)
          //
            return revisions.length
        }
        return 0
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get the number of revisions.
 *
 * @param {string} article - Article name.
 * @param {Date} from - The start date for searching.
 * @param {Date} to - The end date for searching.
 *
 * @return Resolve article's revision count if succeed, reject error if fail.
 */
const getRevisionCountByArticle = async (article, from, to) => {
    try {
        return await Revision.find({
            title: article,
            timestamp: {
                $gte: from,
                $lt: to
            }
        })
            .countDocuments()
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get the top 5 regular users ranked by total revision numbers on this article, and the respective revision numbers
 *
 * @param {string} article - Article name.
 * @param {Date} from - The start date for searching.
 * @param {Date} to - The end date for searching.
 *
 * @return {Promise} Resolve top 5 regular users if succeed, reject error if fail.
 */
const getTopRegularUsersByArticle = async (article, from, to) => {
    try {
        const bots = await Bot.distinct('name'),
            admins = await Admin.distinct('name')
        const botsAndAdmins = bots.concat(admins)
        const topUsers = await Revision.aggregate([
            {
                $match: {
                    title: article,
                    userType: 'regular',
                    timestamp: {
                        $gte: from,
                        $lt: to
                    }
                }
            },
            {
                $group: {
                    _id: '$user',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ])
        return topUsers.slice(0, 5)
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get top 3 news about the selected individual article obtained using Reddit API.
 *
 * @param {string} article - Article name.
 * @param {Date} from - The start date for searching.
 * @param {Date} to - The end date for searching.
 *
 * @return {Promise} Resolve top 3 news about the selected individual article obtained  if succeed, reject error if fail.
 */
const getTopNewsByArticle = async (article, from, to) => {
    let after = from.getTime(),
        before = to.getTime()
    const url = `https://www.reddit.com/r/news/search/.json?q=${article}&restrict_sr=1&limit=3&sort=top&before=${before}&after=${after}`
    try {
        const data = await request(url)
        const json = JSON.parse(data);
        const results = json.data.children
        let topNews = []
        results.forEach(result => {
            topNews.push({
                title: result.data.title,
                url: result.data.url
            })
        })
        return topNews
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For selected article, get the revision number distributed by year and by user type.
 *
 * @param {string} article - The article title.
 * @param {Date} from - The start date for searching.
 * @param {Date} to - The end date for searching.
 */
const getRevDistributionByYearAndUserType = async (article, from, to) => {
    /* const bots = await Bot.distinct('name')
     const admins = await Admin.distinct('name')
     const nonBotsOrAdmin = admins.concat(bots)*/
    try {
        const [botRevDistribution, adminRevDistribution, anonRevDistribution, regularRevDistribution] = await Promise.all([
            getRevDistributionByUserType(article, 'bot', from, to),
            getRevDistributionByUserType(article, 'admin', from, to),
            getRevDistributionByUserType(article, 'anonymous', from, to),
            getRevDistributionByUserType(article, 'regular', from, to)
        ])

        return {
            bot: botRevDistribution,
            admin: adminRevDistribution,
            anon: anonRevDistribution,
            regular: regularRevDistribution
        }
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For selected article, get the revision number distributed by year and by given user type.
 */
const getRevDistributionByUserType = async (article, userType, from, to) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    title: article,
                    userType: userType,
                    timestamp: {
                        $gte: from,
                        $lt: to
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $year: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For selected article, find the revision number distribution based on user type for this article in a given year range.
 *
 * @param {string} article - The article title
 * @param {Date} from - The start date for searching.
 * @param {Date} to - The end date for searching.
 *
 * @return {Promise} - Resolve revision count by user type if succeed, reject error if fail.
 */
const getRevDistributionDataForPieChart = async (article, from, to) => {
    try {
        let result = await Revision.aggregate([
            {
                $match: {
                    title: article,
                    timestamp: {
                        $gte: from,
                        $lt: to
                    }
                }
            },
            {
                $group: {
                    _id: '$userType',
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
        let revCount = {}
        for (let res of result) {
            revCount[res._id] = res.count
        }
        if (revCount.adminAndBot) {
            revCount.admin += revCount.adminAndBot
            revCount.bot += revCount.adminAndBot
        }
        return revCount
    } catch (err) {
        throw new Error(err)
    }
}

const getRevDistributionByTopUsers = async (topUsers, article, from, to) => {
    let users = []
    for (let user of topUsers) {
        users.push(user._id)
    }
    try {
        const result = await Revision.aggregate([
            {
                $match: {
                    title: article,
                    timestamp: {
                        $gte: from,
                        $lt: to
                    },
                    user: {
                        $in: users
                    }
                }
            },
            {
                $group: {
                    _id: {
                        user: '$user',
                        year: {
                            $year: '$timestamp'
                        }
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    user: '$_id.user',
                    year: '$_id.year',
                    count: '$count'
                }
            },
            {
                $sort: {
                    year: 1
                }
            }
        ])
        // console.log(result)
        let revCount = {}
        for (let res of result) {
            if (!revCount.hasOwnProperty(res.user)) {
                revCount[res.user] = {
                    years: [],
                    count: []
                }
            }
            revCount[res.user].years.push(res.year)
            revCount[res.user].count.push(res.count)
        }
        return revCount
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    findArticlesWithTitleAndRevisionCount,
    findLatestTimestamp,
    updateRevisions,
    getRevisionCountByArticle,
    getTopRegularUsersByArticle,
    getTopNewsByArticle,
    getRevDistributionByYearAndUserType,
    getRevDistributionDataForPieChart,
    getRevDistributionByTopUsers
}
