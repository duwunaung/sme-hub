const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const checkSubscriberSession = (req, res, next) => {
	if (req.session.token) {
		const token = req.session.token
		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				res.redirect('/subscriber/login')
			}
			if (user.role === 'superadmin') {
				res.redirect('/subscriber/login')
			}
			next()
		})
	} else {
		res.redirect('/subscriber/login')
	}
}

module.exports = checkSubscriberSession