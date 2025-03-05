const db_connection = require('../../utils/connection')
const moment = require('moment')

exports.getOrgProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access organization profile page"
        })
    }

    const orgId = req.user.orgId
    db_connection.query("SELECT id, name, address, phone, baseCurrency, logo, expiredDate FROM orgs WHERE id = ?", [orgId], (err, results) => {
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
};

exports.updateOrgProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from super organization"
        })
    }

    const orgId = req.user.orgId
    const { name, address, phone, baseCurrency } = req.body
	if (!name || !address || !phone || !baseCurrency) {
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
	parameters.push(address)
	parameters.push(phone)
	parameters.push(baseCurrency)
	let sql = ''
	
	const logo = req.body.logo
	if (!logo) {
		sql = "UPDATE orgs SET name = ?, address = ?, phone = ?, baseCurrency = ? WHERE id = ?"
		parameters.push(orgId)
	}  else {
		sql = "UPDATE orgs SET name = ?, address = ?, phone = ?, baseCurrency = ? , logo = ? WHERE id = ?"
		parameters.push(logo)
		parameters.push(orgId)
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
            message: 'Organization updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                logo: logo
            }
        })
    })
}

exports.updateSalesperson = (req, res) => {
	const { name } = req.body
	if (!name) {
        return res.status(400).send({
            success: false,
            message: 'name is required',
            dev: "name is required"
        })
    }
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }

    const orgId = req.user.orgId
	const createdBy = req.user.id
	const id = req.params.id
    db_connection.query("UPDATE salesperson SET name = ? WHERE orgId = ? and id = ?", [name, orgId, id], (err, results) => {
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
                message: 'Salesperson not found',
                dev: "Salesperson not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the Salesperson',
            dev: "Good Job, Bro!",
            data: {
				name: name,
				orgId: orgId,
				createdBy: createdBy
			}
        })
    })
};

exports.getSalespersonName = (req, res) => {
	if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to salespersons' data"
        })
    }
    const {name} = req.params
	const orgId = req.user.orgId
    let query = `SELECT * FROM salesperson WHERE salesperson.name = '${name}' and salesperson.orgId = ${orgId}`;

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
                message: 'Data not found',
                dev: "Data not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: "We found the data!",
            dev: "Thanks bro, you`re awesome",
            data: results[0]
        })
    });
}

exports.getSalesperson = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }

    const orgId = req.user.orgId
	const id = req.params.id
    db_connection.query("SELECT * FROM salesperson WHERE orgId = ? and id = ?", [orgId, id], (err, results) => {
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
                message: 'Salesperson not found',
                dev: "Salesperson not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the Salesperson',
            dev: "Good Job, Bro!",
            data: results[0]
        })
    })
};

exports.getSalespersonList = (req, res) => {
	const { page = 1, pageSize = 10 , search} = req.query;
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
	const offset = (page - 1) * pageSize;
    const orgId = req.user.orgId
	const queryParams = []
    let query = `
        SELECT * FROM salesperson WHERE orgId = ?
    `;
	queryParams.push(orgId)
	if (search) {
		query += ` AND (name LIKE ? )`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
	}
	query += ` ORDER BY id DESC LIMIT ? OFFSET ?`
	queryParams.push(parseInt(pageSize))
	queryParams.push(offset)
    db_connection.query(query, queryParams, (err, results) => {
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
                message: 'Salespersons not found',
                dev: "Salespersons not found"
            })
        }
		const totalNum = results.length;
		let countQuery = `SELECT COUNT(*) AS total FROM salesperson WHERE orgId = ?`;
		const countParams = []
		countParams.push(orgId)
		if (search) {
			countQuery += ` AND (name LIKE ? )`;
			const searchPattern = `%${search}%`;
			countParams.push(searchPattern);
		}
		db_connection.query(countQuery, countParams, (err, countResults) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                });
            }

			const total = countResults[0].total;
            const totalPages = Math.ceil(total / pageSize);
			res.status(200).send({
				success: true,
				message: 'Here is the Salesperson list',
				dev: "Good Job, Bro!",
				data: results,
				totalNum: totalNum,
                pagination: {
                    total: total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: totalPages
				}
			})

		})
        
    })
};

exports.createSalesperson = (req, res) => {
    const { name } = req.body
    const orgId = req.user.orgId
    const createdBy = req.user.id
    if (!name) {
        return res.status(400).send({
            success: false,
            message: 'name is required',
            dev: "name is required"
        })
    }
	let query = ''
	const parameters = []
	query = `INSERT INTO salesperson (name, orgId, createdBy, status) VALUES (?, ?, ?, ?)`
	parameters.push(name)
	parameters.push(orgId)
	parameters.push(createdBy)
	parameters.push('active')
    db_connection.query(query, parameters, (err, results) => {
        if (err) {
			if (err.code === "ER_DUP_ENTRY") {
				return res.status(501).send({
					success: false,
					message: 'duplicate_name',
					dev: err
				})
			}
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Salesperson added successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                orgId: orgId,
                createdBy: createdBy
            }
        })
    })
}

exports.deleteSalesperson = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const query = `UPDATE salesperson SET status = 'deleted' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
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
                message: 'Salesperson not found',
                dev: "Salesperson not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Salesperson deleted successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.restoreSalesperson = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const query = `UPDATE salesperson SET status = 'active' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
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
                message: 'salesperson not found',
                dev: "salesperson not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'salesperson restored successfully',
            dev: "Good Job, Bro!",
        })
    })
}
