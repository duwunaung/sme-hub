
const db_connection = require('../../utils/connection')
const { calculatedExpiryDate } = require("../../utils/others")

exports.listOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }
    const { name, status = 'all', page = 1, pageSize = 10, expired = false } = req.query

    let query = "SELECT * FROM orgs WHERE 1=1"
    let queryParams = []

    if (name) {
        query += " AND name LIKE ?"
        queryParams.push(`%${name}%`)
    }

    if (status != 'all') {
        if (status) {
            query += " AND status LIKE ?"
            queryParams.push(`%${status}%`)
        }

        if (!expired) {
            query += " AND expiredDate > NOW()"
        } else {
            query += " AND expiredDate < NOW()"
        }
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

        db_connection.query("SELECT COUNT(*) as total FROM orgs", (err, count) => {
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

exports.createOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const expiry = calculatedExpiryDate()
    const { name, address, phone, status = 'active' } = req.body
    db_connection.query("INSERT INTO orgs (name, address, phone, expiredDate, status) VALUES (?,?,?,?,?)", [name, address, phone, expiry, status], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Organization created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                address: address,
                phone: phone,
                status: 'active',
                expiredDate: expiry
            }
        })
    })
}

exports.updateOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    const { name, address, phone, status } = req.body

    db_connection.query("UPDATE orgs SET name = ?, address = ?, phone = ?, status = ? WHERE id = ?", [name, address, phone, status, orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Organization updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                address: address,
                phone: phone,
                status: 'active'
            }
        })
    })
}

exports.licenseOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    const { num, type } = req.body
	const today = new Date()
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	const formattedToday = `${year}-${month}-${day}`;
    db_connection.query("SELECT * FROM orgs WHERE id = ?", [orgId], (err, results) => {
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
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        const org = results[0]
        let expiry = new Date(org.expiredDate)
		const yearExpiry = today.getFullYear();
		const monthExpiry = String(today.getMonth() + 1).padStart(2, '0');
		const dayExpiry = String(today.getDate()).padStart(2, '0');
		const formattedExpiry = `${yearExpiry}-${monthExpiry}-${dayExpiry}`;
        if (type == 'month') {
            expiry.setMonth(expiry.getMonth() + parseInt(num))
        } else {
            expiry.setDate(expiry.getDate() + parseInt(num))
        }

		if ((formattedExpiry < formattedToday && parseInt(num) < 0) || parseInt(num) == 0 ) {
			return res.status(406).send({
				success: false,
				message: 'not acceptable'
			})
		} else {
			db_connection.query("UPDATE orgs SET expiredDate = ? WHERE id = ?", [expiry, orgId], (error, results) => {
				if (error) {
					return res.status(500).send({
						success: false,
						message: 'internal server error',
						dev: error
					})
				}
				res.status(200).send({
					success: true,
					message: 'Organization license updated successfully',
					dev: "Good Job, Bro!",
					data: {
						expiredDate: expiry
					}
				})
			})
		}
        
    })
}

exports.deleteOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    db_connection.query("UPDATE orgs SET status = 'deleted' WHERE id = ?", [orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Organization deleted successfully',
            dev: "Good Job, Bro!"
        })
    })
}

exports.getOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    db_connection.query("SELECT * FROM orgs WHERE id = ?", [orgId], (err, results) => {
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
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the organization',
            dev: "Good Job, Bro!",
            data: results[0]
        })
    })
}

exports.restoreOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    db_connection.query("UPDATE orgs SET status = 'active' WHERE id = ?", [orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Organization restored successfully',
            dev: "Good Job, Bro!"
        })
    })
}

exports.listUsers = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }
    const { name, status = 'all', page = 1, pageSize = 10, expired = false } = req.query

    const orgId = req.params.id

    let query = "SELECT * FROM users WHERE orgId = ?"
    let queryParams = [orgId]

    if (name) {
        query += " AND name LIKE ?"
        queryParams.push(`%${name}%`)
    }

    if (status != 'all') {
        if (status) {
            query += " AND status LIKE ?"
            queryParams.push(`%${status}%`)
        }

        if (!expired) {
            query += " AND expiredDate > NOW()"
        } else {
            query += " AND expiredDate < NOW()"
        }
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

        db_connection.query("SELECT COUNT(*) as total FROM users where orgId = ?", [orgId], (err, count) => {
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

exports.deleteUser = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const userId = req.params.id
    db_connection.query("UPDATE users SET status = 'deleted' WHERE id = ?", [userId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
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
        return res.status(200).send({
            success: true,
            message: 'User deleted successfully',
            dev: "Good Job, Bro!"
        })
    })
}