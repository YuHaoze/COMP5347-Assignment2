var express = require('express')
var router = express.Router();
var {checkCookie,authenticated} = require('../middlewares/authMiddleware')
var analyticsController = require('../controllers/analyticsController')
var importController = require('../controllers/importController')
var authorController = require('../controllers/authorController')
var articleController = require('../controllers/articleController')

// router.use(checkCookie)
router.use(authenticated)

router.get('/', analyticsController.index)
router.post('/import-data', importController.importData)

// Overall analytics routers
router.get('/findHighestLowestRevisions', analyticsController.findHighestLowestRevisions)
router.get('/findHighestLowestGroup', analyticsController.findHighestLowestGroup)
router.get('/findLongestShortestHistory', analyticsController.findLongestShortestHistory)
router.get('/findUserTypeByYear', analyticsController.findUserTypeByYear)
router.get('/findUserType', analyticsController.findUserType)

// Author analytics routers
router.post('/get-authors', authorController.getAuthorNames);
router.post('/analyse-by-author', authorController.analyseByAuthor);

// Individual article analytics routers
router.post('/get-articles', articleController.getArticlesInfo)
router.post('/analyse-article', articleController.analyseArticle)

module.exports = router;


