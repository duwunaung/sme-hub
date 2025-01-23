const express = require('express')
const { login, logout } = require("../../controllers/v0.1/suViewsController")

const checkSubscriberSession = require('../../middlewares/viewSubscribers');
const tmpSession = require('../../middlewares/tmp');
const router = express.Router();

router.use('/login', login)
router.use('/logout', logout)

router.use('/home', checkSubscriberSession, (req, res) => {
    res.render('subscriber/home', { token: req.session.token, user: req.session.user })
})

module.exports = router;
