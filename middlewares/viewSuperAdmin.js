const checkSuperAdminSession = (req, res, next) => {
    if (req.session.token) {
        next()
    } else {
        res.redirect('/superadmin/login')
    }
}

module.exports = checkSuperAdminSession


