require('dotenv').config()

const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).send({
            success: false,
            message: 'Permission Denied!',
            dev: "Token's missing"
        })
    }

    const token = authHeader

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'Permission Denied!',
                dev: "Invalid Token"
            })
        }
        req.user = user
		// console.log(user)
        next()
    })
}


module.exports = authenticateToken