require('dotenv').config()

const db_connection = require('../../utils/connection')
const { calculatedExpiryDate } = require("../../utils/others")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var nodemailer = require('nodemailer');
exports.register = async (req, res) => {

    try {
        if (req.user.orgId !== 0) {
            return res.status(403).send({
                success: false,
                message: 'You cannot access at the moment, kindly contact admin team',
                dev: "This user is from other organization not from us"
            })
        }
        const { name, email, phone, password, remark, orgId, role } = req.body

        const hashedPassword = await bcrypt.hash(password, 10)
        const expiredDate = calculatedExpiryDate()

        db_connection.query(
            'INSERT INTO users (name, email, phone, password, registered, status, expired, remark, orgId, role) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [name, email, phone, hashedPassword, new Date(), 'active', expiredDate, remark, orgId, role],
            (err, result) => {
                if (err) {
                    if (err.code ==  "ER_DUP_ENTRY") {
                        return res.status(409).send({
                            success: false,
                            message: 'Email duplicate error',
                            dev: err.message
                        });
                    } else {
                        return res.status(500).send({
                            success: false,
                            message: 'internal server error',
                            dev: "Error while registering new user"
                        })
                    }
                } else {
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL,
                            pass: process.env.APP_PASSWORD
                        }
                    });
                    var mailOptions = {
                        from: process.env.GMAIL,
                        to: email,
                        subject: 'Welcome to Dat Tech Solutions',
                        html: '<h1>Hi, Welcome to Dat Tech Solutions</h1><p>Thanks for joining us</p><br><p>To start using our service, kindly visit to this link with Password "' + password + '"</p><p>Best Regards</p><p>Dat Tech Solutions</p>'
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            res.status(500).send({
                                success: false,
                                message: 'internal server error',
                                dev: error
                            })
                        } else {
                            res.status(201).send({ success: true, message: 'User created successfully', data: { name, email, phone, role } })
                        }
                    });

                }
            })
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'internal server error',
            dev: err
        })
    }
}

exports.login = (req, res) => {
    try {
        const { email, password } = req.body

        db_connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err || results.length == 0) {
                return res.status(401).send({
                    success: false,
                    message: 'Email not found!',
                    dev: "We cannot found this email."
                })
            }
            const user = results[0]

            const passwordMatch = await bcrypt.compare(password, user.password)

            if (!passwordMatch) {
                return res.status(401).send({
                    success: false,
                    message: 'Invalid Password',
                    dev: "Incorrect Password."
                })
            }

            if (new Date() > new Date(user.expired)) {
                return res.status(403).send({
                    success: false,
                    message: 'Account Expired, Kindly renew your license.',
                    dev: "Account Expired"
                })
            }

            if (user.status != 'active') {
                return res.status(403).send({
                    success: false,
                    message: 'You cannot access your account at the moment, kindly contact admin team',
                    dev: "Not Activate"
                })
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role, orgId: user.orgId },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            )

            return res.status(200).send({
                success: true,
                message: "Login Success",
                dev: "In future, kindly include Token in header['authorization'].",
                data: {
                    name: user.name,
                    token: token
                }
            })

        })
    } catch (err) {
        res.status(500).send({
            success: false,
            message: 'internal server error',
            dev: err
        })
    }
}

exports.getSuperAdmins = (req, res) => {
    const { status = 'all', name, page = 1, pageSize = 10 } = req.query
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }
    let query = 'SELECT * FROM users WHERE role = "superadmin" AND orgId = 0'

    let queryParams = []

    if (name) {
        query += " AND name OR email LIKE ?"
        queryParams.push(`%${name}%`)
    }

    if (status != 'all') {
        query += " AND status LIKE ?"
        queryParams.push(`%${status}%`)
    }

    const offset = (page - 1) * pageSize
    query += ' LIMIT ? OFFSET ?'
    queryParams.push(parseInt(pageSize), offset)
    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        let countQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'superadmin' AND orgId = 0"
        let countQueryParams = []

        if (name) {
            countQuery += " AND name LIKE ?"
            countQueryParams.push(`%${name}%`)
            countQuery += " AND email LIKE ?"
            countQueryParams.push(`%${name}%`)
        }

        if (status != 'all') {
            countQuery += " AND status LIKE ?"
            countQueryParams.push(`%${status}%`)
        }

        db_connection.query(countQuery, countQueryParams, (err, count) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }

            res.status(200).json({
                success: true,
                data: results,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: count[0].total,
                    totalPage: Math.ceil(count[0].total / pageSize)
                }
            })
        })
    })
}