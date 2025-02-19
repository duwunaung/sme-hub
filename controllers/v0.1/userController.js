const bcrypt = require('bcryptjs')
const db_connection = require('../../utils/connection')
const { calculatedExpiryDate } = require("../../utils/others")

var nodemailer = require('nodemailer');

exports.createUser = async (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied. Outside organization user creation is restricted',
            dev: "Organization Id need to be 0 for superadmin user creation"
        });
    }

    try {
        const { name, password, phone, role, email, orgId, status } = req.body
        const hashedPassword = await bcrypt.hashSync(password, 10)
		const expiredDate = calculatedExpiryDate()
        if (role == 'superadmin') {
            return res.status(403).send({
                success: false,
                message: 'Access denied. You cannot create a superadmin user',
                dev: "Superadmin user creation is restricted from this api"
            });
        }
        const userId = req.user.userId
        const now = new Date()
        db_connection.query('INSERT INTO users (name, password, phone, role, email, orgId, status, registered, expired, updatedBy, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            [name, hashedPassword, phone, role, email, orgId, status, new Date(), expiredDate, userId, now],
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
                            res.status(201).send({
                                success: true,
                                message: 'User created successfully',
                                data: { name, email, phone, role, status }
                            })
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

exports.listUsers = (req, res) => {
    const { page = 1, pageSize = 10, search, role, status = 'active', orgId } = req.query; // Extract pagination and filter parameters

    const offset = (page - 1) * pageSize; // Calculate OFFSET for pagination
    const params = [];

    // Base query to fetch users with their organization name
    let query = `
      SELECT users.id, users.name, users.email, users.phone, users.role, users.status, 
             users.registered, orgs.name AS organization_name 
      FROM users 
      LEFT JOIN orgs ON users.orgId = orgs.id
      WHERE 1=1
    `;

    // Add filters if search or role is provided
    if (search) {
        query += ` AND (users.name LIKE ? OR users.email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
        query += ` AND users.role = ?`;
        params.push(role);
    }

    if (status) {
        query += ` AND users.status = ?`;
        params.push(status);
    }

    if (orgId) {
        query += ` AND users.orgId = ?`;
        params.push(orgId);
    }
    // Add pagination
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(pageSize), parseInt(offset));

    // Execute the query to fetch paginated users
    db_connection.query(query, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Failed to retrieve users' });
        }

        // Fetch total count of users for pagination metadata
        let countQuery = `
        SELECT COUNT(*) AS total 
        FROM users 
        LEFT JOIN orgs ON users.orgId = orgs.id 
        WHERE 1=1
      `;

        if (search) {
            countQuery += ` AND (users.name LIKE ? OR users.email LIKE ?)`;
        }

        if (role) {
            countQuery += ` AND users.role = ?`;
        }

        db_connection.query(countQuery, params.slice(0, params.length - 2), (countErr, countResults) => {
            if (countErr) {
                return res.status(500).send({ error: 'Failed to count users' });
            }

            const total = countResults[0].total;
            const totalPages = Math.ceil(total / pageSize);

            // Send response
            res.json({
                data: results,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages,
                },
            });
        });
    });
};

exports.getUser = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }
    const userId = req.params.id
    
    let query = `SELECT name, email, role, phone, orgId, status, registered, remark, expired, updatedBy, updatedAt FROM users WHERE users.id = ${userId}`;

    db_connection.query(query, (err, results) => {
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

        const orgId = results[0].orgId
        orgQuery = `SELECT name FROM orgs WHERE id = ${orgId}`;

        db_connection.query(orgQuery, (err, orgResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }
            
            if (orgResult.length === 0) {
                orgName = ""
            } else {
                orgName = orgResult[0].name
            }

            results[0].orgName = orgName
            const updatedBy = results[0].updatedBy

            superadminQuery = `SELECT name FROM users WHERE id = ? AND orgId = 0`;
            db_connection.query(superadminQuery, [updatedBy], (err, superadminResult) => {
                if (err) {
                    return res.status(500).send({
                        success: false,
                        message: 'internal server error',
                        dev: err
                    })
                }
                
                if (superadminResult.length === 0) {
                    superadminName = ""
                } else {
                    superadminName = superadminResult[0].name
                }
    
                results[0].superadminName = superadminName

                return res.status(200).send({
                    success: true,
                    message: "We found this user!",
                    dev: "Thanks bro, you`re awesome",
                    data: results[0]
                })
            })
        })
    });
};

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { name, email, phone, role, status, orgId } = req.body;

    // Ensure superadmin is updating the user (validate org_id = 0 for superadmins)
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied',
            dev: 'Outside organization cannot update user' 
        });
    }
    const superadminId = req.user.userId
    const now = new Date()
    db_connection.query(
        'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ?, orgId = ?, updatedBy = ?, updatedAt = ? WHERE id = ?',
        [name, email, phone, role, status, orgId, superadminId, now, userId],
        (err, result) => {
            if (err) {
                if (err.code ==  "ER_DUP_ENTRY") {
                    return res.status(409).send(
                        {
                            success: false,
                            message: 'Email duplicate error',
                            dev: err.message
                        }
                    );
                } else {
                    return res.status(500).send(
                        {
                            success: false,
                            message: 'Failed to update user',
                            dev: err.message,
                        }
                    );
                }
            }

            if (result.affectedRows === 0) {
                return res.status(404).send(
                    {
                        success: false,
                        message: 'User not found',
                        dev: 'User with the provided ID was not found'
                    }
                );
            }

            res.send(
                {
                    success: true,
                    message: 'User updated successfully',
                    dev: 'User details updated successfully',
                    data: { name, email, phone, role, status, orgId }
                }
            );
        }
    );
};

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    const superadminId = req.user.userId
    const now = new Date()

    // Ensure superadmin is deleting the user (validate org_id = 0 for superadmins)
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied',
            dev: 'Outside organization cannot delete user',
        });
    }

    // Soft delete: change status to 'deleted'
    db_connection.query('UPDATE users SET status = "deleted", updatedBy = ?, updatedAt = ? WHERE id = ? AND orgId = 0', [superadminId, now, userId], (err, result) => {
        if (err) {
            return res.status(500).send({ 
                success: false,
                message: 'Failed to delete user',
                dev: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ 
                success: false,
                message: 'User not found', 
                dev: 'User with the provided ID was not found' 
            });
        }
        res.send({ 
            success: true,
            message: 'User deleted successfully',
            dev: 'User deleted successfully' 
        });
    });
};

exports.restoreUser = ( req, res ) => {
    const userId = req.params.id
    const superadminId = req.user.userId
    const now = new Date()
    // Ensure superadmin is deleting the user (validate org_id = 0 for superadmins)
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied',
            dev: 'Outside organization cannot restore user',
        });
    }
    
    // Soft delete: change status to 'active'
    const query = `UPDATE users SET status = 'active', updatedBy = ?, updatedAt = ? WHERE users.id = ?`
    db_connection.query(query, [superadminId, now, userId], (err,results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
                dev: "User not found"
            })
        }
        res.send({
            success: true,
            message: 'Restored successfully!',
            dev: 'Thanks bro, you`re awesome!'
        })
    })
}