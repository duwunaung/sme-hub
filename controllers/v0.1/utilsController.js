require('dotenv').config()

const db_connection = require('../../utils/connection')
const { calculatedExpiryDate } = require("../../utils/others")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
                    console.log(err)
                    res.status(500).send({
                        success: false,
                        message: 'internal server error',
                        dev: "Error while registering new user"
                    })
                } else {
                    res.status(201).send({
                        success: true,
                        dev: 'No Issue, Thanks',
                        message: 'Successfully Registered',
                        data: {
                            username: name,
                            email: email,
                            phone: phone,
                            role: role,
                            expiredDate: expiredDate
                        }
                    })
                }
            })
    } catch (err) {
        console.log(err);

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
			// console.log(results)
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
                { userId: user.id, email: user.email, role: user.role, orgId: user.orgId},
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN}
            )

            return res.status(200).send({
                success: true,
                message: "Login Success",
                dev: "In future, kindly include Token in header['authorization'].",
                data: {
                    token: token
                }
            })

        })
    } catch (err) {
        console.log(err);

        res.status(500).send({
            success: false,
            message: 'internal server error',
            dev: err
        })
    }
}