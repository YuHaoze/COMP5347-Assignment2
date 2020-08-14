const AuthorAnalyticsService = require('../services/author_analytics_service')

const getAuthorNames = async (req, res) => {
    try {
        const authorNames = await AuthorAnalyticsService.findAllAuthorNames()
        res.status(200).json({names: authorNames})
    } catch (err) {
        res.status(500).json(err)
    }
}

const analyseByAuthor = async (req, res) => {
    try {
        const user = req.body.author
        const results = await AuthorAnalyticsService.findRevisionsByUser(user)
        results.length === 0
            ? res.status(500).json(new Error().message = {message: 'No Result Found.'})
            : res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports = {
    getAuthorNames,
    analyseByAuthor
}
