const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db_connection = require('../../utils/connection');

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            success: false,
            message: 'Please provide email and password',
            dev: "Email and password are required"
        });
    }

    db_connection.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err || results.length == 0) {
            return res.status(401).send({
                success: false,
                message: 'Email not found!',
                dev: "Email not found in the database"
            });
        }

        const user = results[0];

        // Check if the user is soft-deleted
        if (user.status === 'deleted') {
            return res.status(403).send(
                {
                    success: false,
                    message: 'Your account has been deleted',
                    dev: 'User has been deleted'
                }
            );
        }


        // Check if the account is expired
        const currentDate = new Date();
        const expiredDate = new Date(user.expired_date);
        if (expiredDate < currentDate) {
            return res.status(403).send(
                {
                    success: false,
                    message: 'Account has expired. Please renew your subscription.',
                    dev: 'Account has expired'
                });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({
                success: false,
                message: 'Password is incorrect!',
                dev: "Password is incorrect"
            });
        }
        const tokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            org_id: user.org_id,
            status: user.status,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.status(200).send({
            success: true,
            message: 'Login successful',
            dev: "Good Job, Bro!",
            data: {
                token,
                user: tokenPayload
            }
        });
    });
}