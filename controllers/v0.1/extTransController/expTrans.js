const db_connection = require('../../../utils/connection')
const moment = require('moment')

exports.createExpense = (req, res) => {
    const { description, amount, expenseDate, catId, itemName, price, quantity, vendorName } = req.body
    const orgId = req.user.orgId
    const createdBy = req.user.id

    if (!description || !amount || !expenseDate || !catId) {
        return res.status(400).send(
            {
                success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
            }
        )
    }

	const receipt = req.body.receipt
    let query = `INSERT INTO exps (description, amount, expenseDate, catId, orgId, createdBy`
	let values = [description, amount, expenseDate, catId, orgId, createdBy];
	const optionalFields = { receipt, itemName, price, quantity, vendorName };
	Object.entries(optionalFields).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			query += `, ${key}`;
			values.push(value);
		}
	});
	query += ') VALUES (' + values.map(() => '?').join(', ') + ')';
    db_connection.query(query, values, (err, result) => {
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
                message: 'Expense created successfully',
                dev: 'Thanks bro, you are awesome',
                data: result
            }
        )
    })
}

exports.updateExpense = (req, res) => {
    const { id } = req.params
    const { description, amount, catId,  itemName, price, quantity, vendorName } = req.body
    const orgId = req.user.orgId

    if (!description || !amount || !catId) {
        return res.status(400).send(
            {
                success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
            }
        )
    }
	let sql = 'UPDATE exps SET description = ?, amount = ? , catId = ?'
	let values = [description, amount, catId];
	const receipt = req.body.receipt;
	const optionalFields = { receipt, itemName, price, quantity, vendorName };
	Object.entries(optionalFields).forEach(([key, value]) => {
		if (value !== null && value !== undefined) {
			sql += `, ${key} = ?`;
			values.push(value);
		}
	});
	sql += 'WHERE id = ? AND orgId = ?'
	values.push(id)
	values.push(orgId)
	
    db_connection.query(sql, values, (err, result) => {
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
                message: 'Expense updated successfully',
                dev: 'Thanks bro, you are awesome',
                data: {
                    id: id,
                    description: description,
                    amount: amount,
                    catId: catId
                }
            }
        )
    })
}

exports.deleteExpense = (req, res) => {
    const { id } = req.params
    const orgId = req.user.orgId

    const query = `DELETE FROM exps WHERE id = '${id}' AND orgId = '${orgId}'`
    db_connection.query(query, (err, result) => {
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
                message: 'Expense deleted successfully',
                dev: 'Thanks bro, you are awesome',
                data: {
                    id: id
                }
            }
        )
    })
}

exports.getExpense = (req, res) => {
	if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    let query = `SELECT e.id, e.description, e.amount, e.expenseDate, e.itemName, e.vendorName, e.price, e.quantity, e.catId, e.orgId, e.createdBy, e.receipt, o.baseCurrency AS baseCurrency , u.name AS username, ec.name AS category, ec.parentId AS parentId
	FROM exps e 
	JOIN orgs o ON e.orgId = o.id
	JOIN users u ON e.createdBy = u.id
	JOIN expcats ec ON e.catId = ec.id
	WHERE e.id = ${id}`;

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

exports.listExpenses = (req, res) => {
    const {page = 1, pageSize = 10, fromDate, toDate, catId, num, type, search} = req.query
	const orgId = req.user.orgId
	const offset = (page - 1) * pageSize
	const queryParams = []

	let sql = `SELECT e.id,
	e.description,
	e.amount,
	e.expenseDate,
	c.name as category,
	u.name as createdBy,
	o.baseCurrency as baseCurrency
	FROM exps e JOIN expcats c ON e.catId = c.id JOIN users u ON e.createdBy = u.id JOIN orgs o ON e.orgId = o.id WHERE e.orgId = '${orgId}'`
	if (fromDate) {
		sql += ` AND e.expenseDate >= '${fromDate}'`
	}
	if (toDate) {
		sql += ` AND e.expenseDate <= '${toDate}'`
	}
	if (catId) {
		sql += ` AND e.catId = '${catId}'`
	}
	if (search) {
		sql += ` AND (e.description LIKE ? OR e.amount = ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, search);
	}
	if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
				sql += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            			AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
			} else {
				sql += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
				queryParams.push(num);
			}
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                sql += ` AND expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                sql += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                sql += ` AND expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                sql += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
				if (parseInt(num) === 1) {
					sql += ` AND expenseDate >= CURDATE() AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					sql += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					queryParams.push(num);
				}
			}
        }
    }
	sql += `ORDER BY expenseDate DESC LIMIT ${pageSize} OFFSET ${offset}`
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
		let countQuery = `SELECT COUNT(*) as total from exps e WHERE orgId = '${orgId}'`
		let countParams = []
		if (fromDate) {
			countQuery += ` AND e.expenseDate >= '${fromDate}'`
		}
		if (toDate) {
			countQuery += ` AND e.expenseDate <= '${toDate}'`
		}
		if (catId) {
			countQuery += ` AND e.catId = '${catId}'`
		}
		if (search) {
			countQuery += ` AND (e.description LIKE ? OR e.amount = ?)`;
			const searchPattern = `%${search}%`;
			countParams.push(searchPattern, search);
		}
		if (num && type && ["day", "week", "month"].includes(type)) {
			if (type === "week") {
				if (parseInt(num) === 1) {
					countQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
							AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					countQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
					countParams.push(num);
				}
			} else if (type === "month") {
				if (parseInt(num) === 1) {
					countQuery += ` AND expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
				} else if (parseInt(num) === -1) {
					countQuery += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
					countQuery += ` AND expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
				} else {
					countQuery += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
					countParams.push(num - 1);
				}
			} else {
				if (type === "day") {
					if (parseInt(num) === 1) {
						countQuery += ` AND expenseDate >= CURDATE() AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					} else {
						countQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
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
                    message: 'Expense fetched successfully',
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

exports.getMonthlyExpenses = (req, res) => {
    const { month } = req.query // E.g '2021-09'
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

    const targetMonth = moment(month).format('YYYY-MM')
    const startDate = `${targetMonth}-01`
    const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')

    // Total based on category, total transaction
    const query = `SELECT
        SUM(e.amount) as total,
        COUNT(e.id) as totalTransactions,
        c.name as category
        FROM exps e
        JOIN expcats c ON e.catId = c.id
        WHERE e.orgId = '${orgId}'
        AND e.expenseDate BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY c.name
        ORDER BY c.name`

    db_connection.query(query, (err, result) => {
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
                data: result
            }
        )
    })

}