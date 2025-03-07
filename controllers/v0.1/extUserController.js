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

    db_connection.query("SELECT * FROM users WHERE email = ? AND orgId != 0", [email], async (err, results) => {
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

        const expiredQuery = `SELECT expiredDate, name, logo, baseCurrency FROM orgs WHERE id = ${user.orgId}`;

        db_connection.query(expiredQuery, async (err, result) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Internal server error',
                    dev: err
                });
            }
            const expiredDate = new Date(result[0].expiredDate);
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
                orgId: user.orgId,
                status: user.status,
				orgName: result[0].name,
				orgLogo: result[0].logo,
				baseCurrency: result[0].baseCurrency
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
    });
}

exports.getUserProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access organization profile page"
        })
    }

    const id = req.user.id
    db_connection.query("SELECT id, name, email, phone FROM users WHERE id = ?", [id], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
                dev: "User not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the user',
            dev: "Good Job, Bro!",
            data: results[0]
        })
    })
};

exports.checkPass = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access organization profile page"
        })
    }

    const id = req.user.id
    db_connection.query("SELECT password FROM users WHERE id = ?", [id], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
                dev: "User not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the user',
            dev: "Good Job, Bro!",
            data: results[0]
        })
    })
};

exports.updateUserProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from super organization"
        })
    }

    const id = req.user.id
    const { name, email, phone, password } = req.body
	if (!name || !email || !phone ) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}
	
	const parameters = []
	parameters.push(name)
	parameters.push(email)
	parameters.push(phone)
	
	let sql = ''
	if (password) {
		sql = "UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?"
		parameters.push(password)
		parameters.push(id)
	} else {
		sql = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?"
		parameters.push(id)
	}
	

    db_connection.query(sql, parameters, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'User updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name
            }
        })
    })
}