// const db = require('../../utils/connection')
const db_connection = require('../../utils/connection')
const moment = require('moment')

const { createConnection } = require("mysql2");

exports.listAllTransactions = (req, res) => {
    const { page = 1, pageSize = 10, fromDate, toDate, num, type, search } = req.query;
    const orgId = req.user.orgId;
    const offset = (page - 1) * pageSize;
    const queryParams = [];

    let baseSQL = `
        SELECT * FROM (
            SELECT id, description, amount, transactionDate, category, createdBy, baseCurrency, 'expense' AS transactionType 
            FROM (
                SELECT e.id, e.description, e.amount, e.expenseDate AS transactionDate, c.name AS category, u.name AS createdBy, o.baseCurrency AS baseCurrency
                FROM exps e
                JOIN expcats c ON e.catId = c.id
                JOIN users u ON e.createdBy = u.id
                JOIN orgs o ON e.orgId = o.id
                WHERE e.orgId = ?
            ) AS expenses

            UNION ALL

            SELECT id, description, amount, transactionDate, category, createdBy, baseCurrency, 'income' AS transactionType 
            FROM (
                SELECT i.id, i.description, i.amount, i.incomeDate AS transactionDate, c.name AS category, u.name AS createdBy, o.baseCurrency AS baseCurrency
                FROM incs i
                JOIN inccats c ON i.catId = c.id
                JOIN users u ON i.createdBy = u.id
                JOIN orgs o ON i.orgId = o.id
                WHERE i.orgId = ?
            ) AS incomes
        ) AS combined_transactions
        WHERE 1=1
    `;

    queryParams.push(orgId, orgId);

    if (fromDate) {
        baseSQL += ` AND transactionDate >= ?`;
        queryParams.push(fromDate);
    }
    if (toDate) {
        baseSQL += ` AND transactionDate <= ?`;
        queryParams.push(toDate);
    }
    if (search) {
        baseSQL += ` AND (description LIKE ? OR amount = ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, search);
    }
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                baseSQL += ` AND transactionDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                            AND transactionDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
            } else {
                baseSQL += ` AND transactionDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                baseSQL += ` AND transactionDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                baseSQL += ` AND transactionDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                baseSQL += ` AND transactionDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                baseSQL += ` AND transactionDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
                if (parseInt(num) === 1) {
                    baseSQL += ` AND transactionDate >= CURDATE() AND transactionDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    baseSQL += ` AND transactionDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND transactionDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    queryParams.push(num);
                }
            }
        }
    }

    // Create count query using the same filters
    const countSQL = `SELECT COUNT(*) as total FROM (${baseSQL}) as filtered_transactions`;
    
    // Create final query for data
    const dataSQL = baseSQL + ` ORDER BY transactionDate DESC LIMIT ? OFFSET ?`;
    const dataParams = [...queryParams, parseInt(pageSize), offset];

    // Execute count query first
    db_connection.query(countSQL, queryParams, (err, countResult) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                dev: err
            });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / pageSize);

        // Then execute data query
        db_connection.query(dataSQL, dataParams, (err, results) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Internal server error',
                    dev: err
                });
            }

            const totalAmt = results.reduce((total, item) => total + item.amount, 0);
            
            return res.status(200).send({
                success: true,
                message: 'All transactions fetched successfully',
                data: results,
                totalNum: results.length,
                totalAmt: totalAmt,
                pagination: {
                    total: total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: totalPages
                }
            });
        });
    });
};

exports.createExpense = (req, res) => {
    const { description, amount, expenseDate, catId } = req.body
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

	const receiptFilename = req.body.receipt || null
    const query = `INSERT INTO exps (description, amount, expenseDate, catId, orgId, createdBy, receipt) VALUES ('${description}', '${amount}', '${expenseDate}', '${catId}', '${orgId}', '${createdBy}', '${receiptFilename}')`
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
    const { description, amount, expenseDate, catId } = req.body
    const orgId = req.user.orgId

    if (!description || !amount || !expenseDate || !catId) {
        return res.status(400).send(
            {
                success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
            }
        )
    }

    const query = `UPDATE exps SET description = '${description}', amount = '${amount}', expenseDate = '${expenseDate}', catId = '${catId}' WHERE id = '${id}' AND orgId = '${orgId}'`
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
                message: 'Expense updated successfully',
                dev: 'Thanks bro, you are awesome',
                data: {
                    id: id,
                    description: description,
                    amount: amount,
                    expenseDate: expenseDate,
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
    let query = `SELECT e.id, e.description, e.amount, e.expenseDate, e.catId, e.orgId, e.createdBy, e.receipt, o.baseCurrency AS baseCurrency , u.name AS username
	FROM exps e 
	JOIN orgs o ON e.orgId = o.id
	JOIN users u ON e.createdBy = u.id
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
		const totalNum = results.length
		const totalAmt = results.reduce((total, item) => total + item.amount, 0)
		let countQuery = `SELECT COUNT(*) as total from exps WHERE orgId = '${orgId}'`
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

exports.createIncome = (req, res) => {
	const { description, amount, incomeDate, catId } = req.body
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
	const receiptFilename = req.body.receipt || null
	const sql = 'INSERT into incs (description, amount, incomeDate, catId, orgId, createdBy, receipt) VALUES (?,?,?,?,?,?,?)'
	const values = [description, amount, incomeDate, catId, orgId, createdBy, receiptFilename]
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
	const { description, amount, incomeDate, catId } = req.body
	const orgId = req.user.orgId
	const createdBy = req.user.userId
	const { id } = req.params
	if (!description || !amount || !incomeDate || !catId) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}
	const sql = `UPDATE incs SET description = '${description}', amount = '${amount}', incomeDate = '${incomeDate}', catId = '${catId}' WHERE id = '${id}' AND orgId = '${orgId}'`
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
    let query = `SELECT i.id, i.description, i.amount, i.incomeDate, i.catId, i.orgId, i.createdBy, i.receipt, o.baseCurrency AS baseCurrency , u.name AS username
	FROM incs i 
	JOIN orgs o ON i.orgId = o.id
	JOIN users u ON i.createdBy = u.id
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
		return res.status(200).send({
			success: true,
			message: "We found the data!",
			dev: "Thanks bro, you`re awesome",
			data: results[0]
		})
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
		const totalNum = results.length
		const totalAmt = results.reduce((total, item) => total + item.amount, 0)
		let countQuery = `SELECT COUNT(*) as total from incs WHERE orgId = '${orgId}'`
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