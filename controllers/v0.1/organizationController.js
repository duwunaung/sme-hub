
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
    const { name, status, page = 1, pageSize = 10, expired } = req.query
    let query = "SELECT * FROM orgs WHERE 1=1"
    let queryParams = []

    if (name) {
        query += " AND name LIKE ?"
        queryParams.push(`%${name}%`)
    }

    if (expired != 'true' && status != 'expire') {
        query += " AND expiredDate > NOW() "
    }

    if (status != 'all' && status != 'expire') {
        query += " AND status LIKE ?"
        queryParams.push(`%${status}%`)
    } else if (status == 'expire') {
        query += " AND expiredDate < NOW()"
    }

    query += " ORDER BY id DESC"

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

        let countQuery = "SELECT COUNT(*) as total FROM orgs WHERE 1=1"
        let countQueryParams = []

        if (name) {
            countQuery += " AND name LIKE ?"
            countQueryParams.push(`%${name}%`)
        }
        
        if (expired != 'true') {
            countQuery += " AND expiredDate > NOW() "
        }

        if (status != 'all' && status != 'expire') {
            countQuery += " AND status LIKE ?"
            countQueryParams.push(`%${status}%`)
        } else if (status == 'expire') {
            countQuery += " AND expiredDate < NOW()"
        }

        db_connection.query( countQuery, countQueryParams, (err, count) => {
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
    const userId = req.user.userId
    const expiry = calculatedExpiryDate()
    const { name, address, phone, status = 'active' , country, userTime} = req.body
    db_connection.query("INSERT INTO orgs (name, address, phone, expiredDate, status, updatedBy, updatedAt, baseCountry) VALUES (?,?,?,?,?,?,?,?)", [name, address, phone, expiry, status, userId, userTime, country], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        const orgId = results.insertId

        db_connection.query(`INSERT INTO inccats (name, orgId, createdBy, status, parentId) VALUES  
                        ("Product sales", ${orgId}, 0, 'active', 1),
                        ("Service sales", ${orgId}, 0, 'active', 1),
                        ("Product sales(external)", ${orgId}, 0, 'active', 0),
                        ("Service sales(external)", ${orgId}, 0, 'active', 0),
                        ("Office furniture sales", ${orgId}, 0, 'active', 0),
                        ("Office device sales", ${orgId}, 0, 'active', 0),
                        ("Obtaining a loan", ${orgId}, 0, 'active', 0)`, (err, incats) => {

            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error while creating categories',
                    dev: err
                })
            }

            db_connection.query(`INSERT INTO expcats (name, orgId, createdBy, status, parentId) VALUES  
                        ("Purchase of goods", ${orgId}, 0, 'active', 2),
                        ("Purchase of raw materials", ${orgId}, 0, 'active', 2),
                        ("Purchase of goods(external)", ${orgId}, 0, 'active', 0),
                        ("Purchase of raw materials(external)", ${orgId}, 0, 'active', 0),
                        ("Purchase of office furniture", ${orgId}, 0, 'active', 0),
                        ("Purchase of office device", ${orgId}, 0, 'active', 0),
                        ("Purchase of office stationery", ${orgId}, 0, 'active', 0),
                        ("Purchase of other office accessory", ${orgId}, 0, 'active', 0),
                        ("Transportation costs", ${orgId}, 0, 'active', 0),
                        ("Electric bills", ${orgId}, 0, 'active', 0),
                        ("Water bills", ${orgId}, 0, 'active', 0),
                        ("Office Rent", ${orgId}, 0, 'active', 0),
                        ("Employee salary", ${orgId}, 0, 'active', 0),
                        ("Labour day meal", ${orgId}, 0, 'active', 0),
                        ("Costs for freelancer", ${orgId}, 0, 'active', 0),
                        ("The costs of office software", ${orgId}, 0, 'active', 0),
                        ("The costs of advertising", ${orgId}, 0, 'active', 0),
                        ("The costs for social media", ${orgId}, 0, 'active', 0),
                        ("The costs for license and permit", ${orgId}, 0, 'active', 0),
                        ("Office equipment maintenance costs", ${orgId}, 0, 'active', 0),
                        ("Taxs", ${orgId}, 0, 'active', 0),
                        ("Audit and annual closing costs", ${orgId}, 0, 'active', 0),
                        ("Sale commission", ${orgId}, 0, 'active', 0),
                        ("Loan interest", ${orgId}, 0, 'active', 0),
                        ("Loan repayment", ${orgId}, 0, 'active', 0)`, (err, expcats) => {

            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error while creating categories',
                    dev: err
                })
            }

                res.status(200).send({
                    orgId: orgId,
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

    const userId = req.user.userId
    const now = new Date()
    const orgId = req.params.id
    const { name, address, phone, status, country, userTime } = req.body
    db_connection.query("UPDATE orgs SET name = ?, address = ?, phone = ?, status = ?, updatedBy = ?, updatedAt = ?, baseCountry = ? WHERE id = ?", [name, address, phone, status, userId, userTime, country, orgId], (err, results) => {
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
    const { num, type, userTime } = req.body
	const userId = req.user.userId
    const todayString = req.body.userTime;
	const today = new Date(todayString);
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
        if (expiry < today) {
            expiry = new Date()
        }

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
			db_connection.query("UPDATE orgs SET expiredDate = ?, updatedBy = ?, updatedAt = ? WHERE id = ?", [expiry, userId, userTime, orgId], (error, results) => {
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
    const userId = req.user.userId
    const now = new Date()
    const orgId = req.params.id
    db_connection.query("UPDATE orgs SET status = 'deleted', updatedBy = ?, updatedAt = ? WHERE id = ?", [userId, now, orgId], (err, results) => {
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

        const userId = results[0].updatedBy

        db_connection.query("SELECT name FROM users WHERE id = ? AND orgId = 0", [userId], (err, userResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }
            
            if (userResult.length === 0) {
                userName = ""
            } else {
                userName = userResult[0].name
            }

            results[0].userName = userName

            return res.status(200).send({
                success: true,
                message: 'Here is the organization',
                dev: "Good Job, Bro!",
                data: results[0]
            })
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
    const userId = req.user.userId
    const now = new Date()
    const orgId = req.params.id
    db_connection.query("UPDATE orgs SET status = 'active', updatedBy = ?, updatedAt = ? WHERE id = ?", [userId, now, orgId], (err, results) => {
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
    const { name, status, role, page = 1, pageSize = 10, expired = 'false' } = req.query

    const orgId = req.params.id

    let query = "SELECT * FROM users WHERE orgId = ?"
    let queryParams = [orgId]

    if (name) {
        query += " AND (name LIKE ? OR email LIKE ?)"
        queryParams.push(`%${name}%`)
        queryParams.push(`%${name}%`)
    }

    if (status != 'all') {
        query += " AND status = ?"
        queryParams.push(`${status}`)
    }

    if (role != 'allRoles') {
        query += " AND role = ?"
        queryParams.push(`${role}`)
    }
    query += " ORDER BY id DESC"

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

        let countQuery = "SELECT COUNT(*) as total FROM users where orgId = ?"
        let countQueryParams = [orgId]

        if (name) {
            countQuery += " AND (name LIKE ? OR email LIKE ?)"
            countQueryParams.push(`%${name}%`)
            countQueryParams.push(`%${name}%`)
        }

        if (status != 'all') {
            countQuery += " AND status = ?"
            countQueryParams.push(`${status}`)
        }

        if (role != 'allRoles') {
            countQuery += " AND role = ?"
            countQueryParams.push(`${role}`)
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

exports.deleteUser = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const userId = req.params.id
    const superadminId = req.user.userId
    const now = new Date()
    db_connection.query("UPDATE users SET status = 'deleted', updatedBy = ?, updatedAt = ? WHERE id = ?", [superadminId, now, userId], (err, results) => {
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
