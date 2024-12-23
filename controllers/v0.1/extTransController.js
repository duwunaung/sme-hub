// const db = require('../../utils/connection')
const db_connection = require('../../utils/connection')
const moment = require('moment')

const { createConnection } = require("mysql2");

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

    const query = `INSERT INTO exps (description, amount, expenseDate, catId, orgId, createdBy) VALUES ('${description}', '${amount}', '${expenseDate}', '${catId}', '${orgId}', '${createdBy}')`
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

exports.listExpenses = (req, res) => {
    const { page = 1, pageSize = 10, fromDate, toDate, catId } = req.query
    const orgId = req.user.orgId
    const offset = (page - 1) * pageSize

    let query = `SELECT 
    e.id, 
    e.description, 
    e.amount, 
    e.expenseDate, 
    c.name as category ,
    u.name as createdBy,
    e.createdAt
    FROM exps e
    JOIN expcats c ON e.catId = c.id
    JOIN users u ON e.createdBy = u.id
    WHERE e.orgId = '${orgId}'`

    if (fromDate) {
        query += ` AND e.expenseDate >= '${fromDate}'`
    }

    if (toDate) {
        query += ` AND e.expenseDate <= '${toDate}'`
    }

    if (catId) {
        query += ` AND e.catId = '${catId}'`
    }

    query += ` ORDER BY e.createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`

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

        const countQuery = `SELECT COUNT(*) as total FROM exps WHERE orgId = '${orgId}'`
        db_connection.query(countQuery, (err, countResult) => {
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
                    message: 'Expenses fetched successfully',
                    dev: 'Thanks bro, you are awesome',
                    data: result,
                    pagination: {
                        total: countResult[0].total,
                        page: page,
                        pageSize: pageSize
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
	const createdBy = req.user.userId
	
	if (!description || !amount || !incomeDate || !catId) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}
	const sql = 'INSERT into incs (description, amount, incomeDate, catId, orgId, createdBy, createdAt) VALUES (?,?,?,?,?,?,?)'
	const values = [description, amount, incomeDate, catId, orgId, createdBy, new Date()]
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
	// console.log(req.user)
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
	const sql = `UPDATE incs SET description = '${description}', amount = '${amount}', incomeDate = '${incomeDate}', catId = '${catId}', editedAt = NOW() WHERE id = '${id}' AND orgId = '${orgId}'`
	db_connection.query(sql, (err, results) => {
		if (err) {
			console.log(err)
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

exports.listIncomes = (req, res) => {
	const {page = 1, pageSize = 10, fromDate, toDate, catId} = req.query
	const orgId = req.user.orgId
	const offset = (page - 1) * pageSize

	let sql = `SELECT i.id,
	i.description,
	i.amount,
	i.incomeDate,
	c.name as category,
	u.name as createdBy,
	i.createdAt
	FROM incs i JOIN inccats c ON i.catId = c.id JOIN users u ON i.createdBy = u.id WHERE i.orgId = '${orgId}'`
	if (fromDate) {
		sql += ` AND i.incomeDate >= '${fromDate}'`
	}
	if (toDate) {
		sql += ` AND i.incomeDate <= '${toDate}'`
	}
	if (catId) {
		sql += ` AND i.catId = '${catId}'`
	}
	sql += `ORDER BY i.createdAt DESC LIMIT ${pageSize} OFFSET ${offset}`
	db_connection.query(sql, (err, results) => {
		if (err) {
			console.log(err)
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
		const countQuery = `SELECT COUNT(*) as total from incs WHERE orgId = '${orgId}'`
		db_connection.query(countQuery, (err, totalResult)=> {
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
                    message: 'Income fetched successfully',
                    dev: 'Thanks bro, you are awesome',
                    data: results,
					totalNum: totalNum,
					totalAmt: totalAmt,
                    pagination: {
                        total: totalResult[0].total,
                        page: page,
                        pageSize: pageSize
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