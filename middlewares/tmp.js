const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const tmpSession = (req, res, next) => {
    if (req.session.token) {
        const token = req.session.token
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                res.redirect('/superadmin/login')
            }
            next()
        })
    } else {
        res.redirect('/superadmin/login')
    }
}

module.exports = tmpSession


