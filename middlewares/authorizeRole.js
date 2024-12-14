const authorizeRole = (roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).send({
                success: false,
                message: 'Sorry! Cannot access.',
                dev: "Your role is not able to access this route."
            })
        }
        next()
    }
}

module.exports = authorizeRole