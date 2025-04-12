const express = require('express')
const router = express.Router();

router.use('/', (req, res) => {
	if (req.method == 'GET') {
    	res.render('homePage/homePage');
	}
});

module.exports = router;