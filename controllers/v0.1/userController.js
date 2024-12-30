const bcrypt = require('bcryptjs')
const db_connection = require('../../utils/connection')

exports.createUser = async (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied. Outside organization user creation is restricted',
            dev: "Organization Id need to be 0 for superadmin user creation"
        });
    }

    try {
        const { name, password, phone, role, email, orgId, status = 'active' } = req.body
        const hashedPassword = await bcrypt.hashSync(password, 10)
        if (role == 'superadmin') {
            return res.status(403).send({
                success: false,
                message: 'Access denied. You cannot create a superadmin user',
                dev: "Superadmin user creation is restricted from this api"
            });
        }
		db_connection.query('INSERT INTO users (name, password, phone, role, email, orgId, status, registered) VALUES (?,?,?,?,?,?,?,?)',
        [name, hashedPassword, phone, role, email, orgId, status, new Date()],
        (err, result) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: "Error while registering new user"
                })
            } else {
                res.status(201).send({ success: true, message: 'User created successfully', data: { name, email, phone, role, status } })
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

exports.getUser = (req, res) => {
	const id = req.params.id
    db_connection.query("SELECT users.name as username, users.id as id, orgs.name as orgname, orgs.id as orgId, users.role, users.email, users.phone, users.status, users.registered FROM users JOIN orgs ON users.orgId = orgs.id WHERE users.id = ?", [id], (err, results) => {
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

exports.updateUser = (req, res) => {
    const userId = req.params.id;
    const { name, email, phone, role, status, orgId } = req.body;

    // Ensure superadmin is updating the user (validate org_id = 0 for superadmins)
    if (req.user.orgId !== 0) {
        return res.status(403).send({ success: false, message: 'Access denied', dev: 'Outside organization cannot update user' });
    }
	db_connection.query(
		'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ?, orgId = ? WHERE id = ?',
		[name, email, phone, role, status, orgId, userId],
		(err, result) => {
			if (err) {
				return res.status(500).send(
					{
						success: false,
						message: 'Failed to update user',
						dev: err.message
					}
				);
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

    // Ensure superadmin is deleting the user (validate org_id = 0 for superadmins)
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'Access denied',
            dev: 'Outside organization cannot delete user',
        });
    }

    // Soft delete: change status to 'deleted'
    db_connection.query('UPDATE users SET status = "deleted" WHERE id = ?', [userId], (err, result) => {
        if (err) {
            return res.status(500).send({ success: false, message: 'Failed to delete user', dev: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ success: false, message: 'User not found', dev: 'User with the provided ID was not found' });
        }

        res.send({ success: true, message: 'User deleted successfully', dev: 'User deleted successfully' });
    });
};