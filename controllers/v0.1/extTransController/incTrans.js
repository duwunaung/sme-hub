const db_connection = require('../../../utils/connection')
const moment = require('moment')

exports.createIncome = (req, res) => {
	const { description, amount, incomeDate, catId, itemName, price, quantity, salespersonId } = req.body
	const orgId = req.user.orgId
	const createdBy = req.user.id

	if (!description || !amount || !incomeDate || !catId) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}
	let sql = 'INSERT INTO incs (description, amount, incomeDate, catId, orgId, createdBy, updatedBy';
	let values = [description, amount, incomeDate, catId, orgId, createdBy, createdBy];
	const customerName = req.body.customer;
	const receipt = req.body.receipt;
	
	const optionalFields = { receipt, itemName, price, quantity, salespersonId, customerName };
	
	Object.entries(optionalFields).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			sql += `, ${key}`;
			values.push(value);
		}
	});
	
	sql += ') VALUES (' + values.map(() => '?').join(', ') + ')';
	db_connection.query(sql, values, (err, results) => {
		if (err) {
			return res.status(500).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
		}
		return res.status(201).send(
            {
                success: true,
                message: 'Income created successfully',
                dev: 'Thanks bro, you are awesome',
                data: results
            }
        )
	})
}

exports.updateIncome = (req, res) => {
	const { description, amount, catId, itemName, price, quantity, salespersonId } = req.body
	const orgId = req.user.orgId
	const createdBy = req.user.userId
	const { id } = req.params
	if (!description || !amount || !catId) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}
	const updatedBy = req.user.id
	const updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
	let sql = 'UPDATE incs SET description = ?, amount = ? , catId = ?, updatedBy = ?, updatedAt = ?'
	let values = [description, amount, catId, updatedBy, updatedAt];
	const customerName = req.body.customer;
	const receipt = req.body.receipt;
	const optionalFields = { receipt, itemName, price, quantity, salespersonId, customerName };
	Object.entries(optionalFields).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			sql += `, ${key} = ?`;
			values.push(value);
		}
	});
	sql += 'WHERE id = ? AND orgId = ?'
	values.push(id)
	values.push(orgId)
	
	db_connection.query(sql, values, (err, results) => {
		if (err) {
			return res.status(500).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
		}
		return res.status(201).send(
			{
				success: true,
                message: 'Income updated successfully',
                dev: 'Thanks bro, you are awesome',
                data: results
			}
		)
	})
}

exports.deleteIncome = (req, res) => {
	const { id } = req.params
	const orgId = req.user.orgId

	const sql = `DELETE from incs WHERE id = '${id}' AND orgId = '${orgId}'`
	db_connection.query(sql, (err, results)=> {
		if (err){
			return res.status(500).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
		}
		return res.status(201).send(
			{
				success: true,
                message: 'Income deleted successfully',
                dev: 'Thanks bro, you are awesome',
                data: results
			}
		)
	})
}

exports.getIncome = (req, res) => {
	if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    let query = `SELECT i.id, i.description, i.amount, i.incomeDate,i.itemName, i.customerName, i.price, i.quantity, i.salespersonId, i.catId, i.orgId, i.createdBy, i.receipt, o.baseCurrency AS baseCurrency , u.name AS username, ic.name AS category, ic.parentId AS parentId
	FROM incs i 
	JOIN orgs o ON i.orgId = o.id
	JOIN users u ON i.createdBy = u.id
	JOIN inccats ic ON i.catId = ic.id
	WHERE i.id = ${id}`;

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
		
		if (results[0].parentId === 1 || results[0].salespersonId) {
			const salespersonId = results[0].salespersonId
			let querySalesperson = `SELECT name FROM salesperson WHERE id = ${salespersonId}`
			db_connection.query(querySalesperson, (error, result) => {
				if (error) {
					return res.status(500).send({
						success: false,
						message: 'internal server error',
						dev: err
					})
				}
				if (result.length > 0) {
					const salesperson = result[0].name
					results[0].salesperson = salesperson
					return res.status(200).send({
						success: true,
						message: "We found the data!",
						dev: "Thanks bro, you`re awesome",
						data: results[0]
					})
				}
				return res.status(200).send({
					success: true,
					message: "We found the data!",
					dev: "Thanks bro, you`re awesome",
					data: results[0]
				})
			})
		} else {
			return res.status(200).send({
				success: true,
				message: "We found the data!",
				dev: "Thanks bro, you`re awesome",
				data: results[0]
			})
		}
    });
}

exports.listIncomes = (req, res) => {
	const {page = 1, pageSize = 10, fromDate, toDate, catId, num, type, search} = req.query
	const orgId = req.user.orgId
	const offset = (page - 1) * pageSize
	const queryParams = []

	let sql = `SELECT i.id,
	i.description,
	i.amount,
	i.incomeDate,
	c.name as category,
	u.name as createdBy,
	o.baseCurrency as baseCurrency
	FROM incs i JOIN inccats c ON i.catId = c.id JOIN users u ON i.createdBy = u.id JOIN orgs o ON i.orgId = o.id WHERE i.orgId = '${orgId}'`
	if (fromDate) {
		sql += ` AND i.incomeDate >= '${fromDate}'`
	}
	if (toDate) {
		sql += ` AND i.incomeDate <= '${toDate}'`
	}
	if (catId) {
		sql += ` AND i.catId = '${catId}'`
	}
	if (search) {
		sql += ` AND (i.description LIKE ? OR i.amount = ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, search);
	}
	if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
			if (parseInt(num) === 1) {
				sql += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            			AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
			} else {
				sql += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
				queryParams.push(num);
			}
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                sql += ` AND incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                sql += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                sql += ` AND incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                sql += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
			if (type === "day") {
				if (parseInt(num) === 1) {
					sql += ` AND incomeDate >= CURDATE() AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					sql += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					queryParams.push(num);
				}
			}
        }
    }
	sql += `ORDER BY incomeDate DESC LIMIT ${pageSize} OFFSET ${offset}`
	db_connection.query(sql, queryParams, (err, results) => {
		if (err) {
            return res.status(500).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
        }
		if (results.length <= 0) {
			return res.status(404).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
		}
		const totalNum = results.length
		const totalAmt = results.reduce((total, item) => total + item.amount, 0)
		let countQuery = `SELECT COUNT(*) as total from incs i WHERE orgId = '${orgId}'`
		let countParams = []
		if (fromDate) {
			countQuery += ` AND i.incomeDate >= '${fromDate}'`
		}
		if (toDate) {
			countQuery += ` AND i.incomeDate <= '${toDate}'`
		}
		if (catId) {
			countQuery += ` AND i.catId = '${catId}'`
		}
		if (search) {
			countQuery += ` AND (i.description LIKE ? OR i.amount = ?)`;
			const searchPattern = `%${search}%`;
			countParams.push(searchPattern, search);
		}
		if (num && type && ["day", "week", "month"].includes(type)) {
			if (type === "week") {
				if (parseInt(num) === 1) {
					countQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
							AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					countQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
					countParams.push(num);
				}
			} else if (type === "month") {
				if (parseInt(num) === 1) {
					countQuery += ` AND incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
				} else if (parseInt(num) === -1) {
					countQuery += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
					countQuery += ` AND incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
				} else {
					countQuery += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
					countParams.push(num - 1);
				}
			} else {
				if (type === "day") {
					if (parseInt(num) === 1) {
						countQuery += ` AND incomeDate >= CURDATE() AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					} else {
						countQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
						countParams.push(num);
					}
				}
			}
		}
		db_connection.query(countQuery,countParams, (err, totalResult)=> {
			if (err) {
				return res.status(500).send(
					{
						success: false,
						message: 'Internal server error',
						dev: err
					}
				)
			}
			const total = totalResult[0].total;
			const totalPages = Math.ceil(total / pageSize);
			return res.status(201).send(
				{
					success: true,
                    message: 'Income fetched successfully',
                    dev: 'Thanks bro, you are awesome',
                    data: results,
					totalNum: totalNum,
					totalAmt: totalAmt,
                    pagination: {
                        total: total,
                        page: page,
                        pageSize: pageSize,
						totalPages: totalPages
                    }
				}
			)
		})
	})
}

exports.getMonthlyIncomes = (req, res) => {
	const { month } = req.query
	const orgId = req.user.orgId

	if (!month) {
		return res.status(400).send(
            {
                success: false,
                message: 'Month is required',
                dev: "Bro, give me month. E.g '2021-09'"
            }
        )
	}

	const targetMonth = moment(month).format("YYYY-MM")
	const startDate = `${targetMonth}-01`
	const endDate = moment(startDate).endOf('month').format("YYYY-MM-DD")

	const sql = `SELECT SUM(i.amount) as total,
	COUNT(i.id) as totalTrans,
	c.name as category
	FROM incs i
	JOIN inccats c ON i.catId = c.id
	WHERE i.orgId = '${orgId}' AND i.incomeDate BETWEEN '${startDate}' AND '${endDate}
	GROUP BY c.name
	ORDER BY c.name'`
	db_connection.query(sql, (err, results) => {
		if (err) {
			return res.status(500).send(
                {
                    success: false,
                    message: 'Internal server error',
                    dev: err
                }
            )
		}
		return res.status(200).send(
            {
                success: true,
                message: 'Monthly expenses fetched successfully',
                dev: 'Thanks bro, you are awesome',
                data: results
            }
        )
	})
}