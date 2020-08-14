var express = require('express')
var router = express.Router();
var loginController = require('../controllers/auth/loginController'),
    pageController = require('../controllers/pageController'),
    registerController = require('../controllers/auth/registerController'),
    forgotPasswordController = require('../controllers/auth/forgotPasswordController'),
    resetController = require('../controllers/auth/resetController')

const {authenticated} = require('../middlewares/authMiddleware')



// Auth routers
router.get('/login', loginController.index);
router.post('/login', loginController.login);
router.get('/register', registerController.index);
router.post('/register', registerController.register);
router.get('/forgot-pwd', forgotPasswordController.index);
router.post('/forgot-pwd', forgotPasswordController.validate);
router.get('/reset', resetController.index);
router.post('/reset', resetController.reset)

router.get('/logout', loginController.logout);

// Page routers
router.get('/home', pageController.index)
router.get('/', pageController.index)



module.exports = router;



