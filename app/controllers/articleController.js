const ArticleAnalyticsService = require('../services/article_analytics_service')

const getArticlesInfo = async (req, res) => {
    try {
        const articlesInfo = await ArticleAnalyticsService.findArticlesWithTitleAndRevisionCount()
        res.status(200).json({
            articlesInfo: articlesInfo,
        })
    } catch (err) {
        res.status(500).json({message: 'Failed to get analytics results because of server internal errors'})
    }
}

const analyseArticle = async (req, res) => {
    try {
        const article = req.body.article,
            from = new Date(parseInt(req.body.from), 1, 1,0,0,0,0),
            to = new Date(parseInt(req.body.to), 11, 31,23,59,59,0)
        let responseMessage = ''
        const latestTimestamp = await ArticleAnalyticsService.findLatestTimestamp(article)
        const timeDiff = (new Date() - latestTimestamp) / (1000 * 3600 * 24)

        // Update article revisions if it is out of date.
        if (timeDiff > 1) {
            // Update revisions via MediaWiki API.
            const newRevisionCount = await ArticleAnalyticsService.updateRevisions(article, latestTimestamp.toISOString())
            responseMessage = `Your data is up-to-date, ${newRevisionCount} revisions downloaded.`
        } else {
            responseMessage = 'Your data is up-to-date, no new revision need to be downloaded.'
        }
        // TODO: search & construct results
        const [revisionCount, topRegularUsers, topNews, barChartOneData, pieChartData] = await Promise.all([
            ArticleAnalyticsService.getRevisionCountByArticle(article, from, to),
            ArticleAnalyticsService.getTopRegularUsersByArticle(article, from, to),
            ArticleAnalyticsService.getTopNewsByArticle(article, from, to),
            ArticleAnalyticsService.getRevDistributionByYearAndUserType(article, from, to),
            ArticleAnalyticsService.getRevDistributionDataForPieChart(article, from, to),
        ])
        const barChartTwoData = await ArticleAnalyticsService.getRevDistributionByTopUsers(topRegularUsers, article, from, to)
        const analyseResults = {
            title: article,
            revisionCount: revisionCount,
            topRegularUsers: topRegularUsers,
            topNews: topNews,
            barChartOneData: barChartOneData,
            message: responseMessage,
            pieChartData: pieChartData,
            barChartTwoData: barChartTwoData
        }
        res.status(200).json(analyseResults)
    } catch (err) {
        res.status(500).json({message: 'API request timeout, please try again.'})
    }
}


module.exports = {
    getArticlesInfo,
    analyseArticle
}




