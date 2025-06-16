const { query } = require('express')
const db_connection = require('../../utils/connection')

exports.createExpenseCategory = (req, res) => {
    const { name, parentId } = req.body
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
	query = `INSERT INTO expcats (name, orgId, createdBy, status, parentId) VALUES (?, ?, ?, ?, ?)`;
	parameters.push(name)
	parameters.push(orgId)
	parameters.push(createdBy)
	parameters.push('active')
	parameters.push(parentId)

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
            message: 'Expense Category created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                orgId: orgId,
                createdBy: createdBy
            }
        })
    })
}

exports.listAllCategories = (req, res) => {
    const orgId = req.user.orgId;
    const { status = 'active' } = req.query;

    const incomeQuery = `
        SELECT ic.id, ic.name, u.name AS createdBy
        FROM inccats ic
        JOIN users u ON ic.createdBy = u.id
        WHERE ic.orgId = ? AND ic.status = ?
    `;
    
    const expenseQuery = `
        SELECT ec.id, ec.name, u.name AS createdBy
        FROM expcats ec
        JOIN users u ON ec.createdBy = u.id
        WHERE ec.orgId = ? AND ec.status = ?
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            db_connection.query(incomeQuery, [orgId, status], (err, incomeResults) => {
                if (err) reject(err);
                else resolve(incomeResults);
            });
        }),
        new Promise((resolve, reject) => {
            db_connection.query(expenseQuery, [orgId, status], (err, expenseResults) => {
                if (err) reject(err);
                else resolve(expenseResults);
            });
        })
    ])
    .then(([incomeCategories, expenseCategories]) => {
        const allCategories = [...incomeCategories, ...expenseCategories];

        res.status(200).send({
            success: true,
            message: 'All Categories list',
            dev: "Good Job, Bro!",
            data: { allCategories }
        });
    })
    .catch(err => {
        res.status(500).send({
            success: false,
            message: 'Internal server error',
            dev: err
        });
    });
};

exports.listExpCatUpdate = (req, res) => {
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
	const { parentId } = req.params
	let query = '';
    query = `
        SELECT ec.id, ec.name, ec.parentId
        FROM expcats ec
        WHERE ec.orgId = ? AND ec.status = ? AND ec.parentId = ${parentId}
    `;

    db_connection.query(query, [orgId, status], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Expense Category list',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.listExpCat = (req, res) => {
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
    const query = `
        SELECT ec.id, ec.name, ec.parentId
        FROM expcats ec
        WHERE ec.orgId = ? AND ec.status = ?
    `;

    db_connection.query(query, [orgId, status], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Expense Category list',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.listIncCatUpdate = (req, res) => {
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
	const { parentId } = req.params
	let query = '';
	query = `
        SELECT ic.id, ic.name,  ic.parentId
        FROM inccats ic
        WHERE ic.orgId = ? AND ic.status = ? AND ic.parentId = ${parentId}
    `;
    db_connection.query(query, [orgId, status], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Expense Category list',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.listIncCat = (req, res) => {
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
    const query = `
        SELECT ic.id, ic.name, ic.parentId
        FROM inccats ic
        WHERE ic.orgId = ? AND ic.status = ?
    `;

    db_connection.query(query, [orgId, status], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Expense Category list',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.listExpenseCategory = (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        search,
        status,
        num,
        type
    } = req.query;
    
    const orgId = req.user.orgId;
    const offset = (page - 1) * pageSize;
    const queryParams = [];

    let query = `
        SELECT 
            ec.id, 
            ec.name,
            ec.status,
            COALESCE(SUM(e.amount), 0) AS totalAmount,
            COUNT(e.id) AS totalTransactions
        FROM expcats ec
        LEFT JOIN exps e ON ec.id = e.catId
        WHERE ec.orgId = ?
    `;
    queryParams.push(orgId);

    if (search) {
        query += ` AND (ec.name LIKE ? )`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
    }

    if (status) {
        query += ` AND ec.status = ?`;
        queryParams.push(status);
    }

    // Date filtering logic for num and type
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                query += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                        AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
            } else {
                query += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                query += ` AND e.expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                query += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                query += ` AND e.expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                query += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
                if (parseInt(num) === 1) {
                    query += ` AND e.expenseDate >= CURDATE() AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    query += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    queryParams.push(num);
                }
            }
        }
    }

    query += `
        GROUP BY ec.id, ec.name, ec.status
        ORDER BY ec.id DESC
        LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(pageSize));
    queryParams.push(offset);

    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            });
        }
		if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'categories not found',
                dev: "categories not found"
            })
        }

        const totalNum = results.length;
        const totalAmount = results.reduce((total, item) => total + item.totalAmount, 0);

        // Construct count query
        let countQuery = `
            SELECT COUNT(DISTINCT ec.id) AS total
            FROM expcats ec
            LEFT JOIN exps e ON ec.id = e.catId
            WHERE ec.orgId = ?
        `;
        const countParams = [orgId];

        if (search) {
            countQuery += ` AND (ec.name LIKE ? )`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern);
        }

        if (status) {
            countQuery += ` AND ec.status = ?`;
            countParams.push(status);
        }

        // Add date filter to the count query
        if (num && type && ["day", "week", "month"].includes(type)) {
            if (type === "week") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                            AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    countQuery += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                    countParams.push(num);
                }
            } else if (type === "month") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND e.expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else if (parseInt(num) === -1) {
                    countQuery += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                    countQuery += ` AND e.expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else {
                    countQuery += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                    countParams.push(num - 1);
                }
            } else {
                if (type === "day") {
                    if (parseInt(num) === 1) {
                        countQuery += ` AND e.expenseDate >= CURDATE() AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    } else {
                        countQuery += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                        countParams.push(num);
                    }
                }
            }
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
                message: 'Expense Category list with transaction data',
                dev: "Good Job, Bro!",
                data: results,
                totalNum: totalNum,
                totalAmount: totalAmount,
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

exports.detailExpenseCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The superadmin cannot access at the moment!"
        });
    }
    const id = req.params.id;
    const { num, type, page = 1, pageSize = 10, search } = req.query;
    const offset = (page - 1) * pageSize;

    let sqlQuery = `SELECT e.id, e.description, e.amount, e.expenseDate, e.catId, e.orgId, o.baseCurrency AS baseCurrency, u.name AS createdBy 
                    FROM exps e 
                    JOIN orgs o ON e.orgId=o.id 
                    JOIN users u ON e.createdBy=u.id 
                    WHERE catId = ?`;
    let queryParams = [id];

    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
				sqlQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            			AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
			} else {
				sqlQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
				queryParams.push(num);
			}
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                sqlQuery += ` AND expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                sqlQuery += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                sqlQuery += ` AND expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                sqlQuery += ` AND expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
				if (parseInt(num) === 1) {
					sqlQuery += ` AND expenseDate >= CURDATE() AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					sqlQuery += ` AND expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					queryParams.push(num);
				}
			}
        }
    }

    if (search) {
        sqlQuery += ` AND (e.description LIKE ? OR e.amount = ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, search);
    }

    sqlQuery += ` ORDER BY expenseDate DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(pageSize), offset);

    db_connection.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: "Internal server error",
                error: err.message
            });
        }

        const totalNum = results.length;
        const totalAmt = results.reduce((total, item) => total + item.amount, 0);

        let countQuery = `SELECT COUNT(*) as total FROM exps WHERE catId = ?`;
        const countParams = [id];

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

        if (search) {
            countQuery += ` AND (description LIKE ? OR amount = ?)`;
            countParams.push(`%${search}%`, search);
        }

        db_connection.query(countQuery, countParams, (err, totalResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: "Internal server error",
                    error: err.message
                });
            }

            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / pageSize);

            if (total === 0) {
                return res.status(404).send({
                    success: false,
                    message: 'Data not found',
                    dev: "Data not found"
                });
            }

            res.status(200).send({
                success: true,
                message: 'Expense Transaction list',
                dev: "Good Job, Bro!",
                data: results,
                totalNum: totalNum,
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

exports.getExpenseCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    
    let query = `SELECT * FROM expcats WHERE expcats.id = ${id}`;

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
            return res.status(200).send({
                success: true,
                message: "We found the data!",
                dev: "Thanks bro, you`re awesome",
                data: results[0]
            })
        })
    });
};

exports.updateExpenseCategory = (req, res) => {
    const { id } = req.params;
    let { name , parentId, status } = req.body;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization
    if (!name) {
        return res.status(400).send({ error: 'Name is required' });
    }
	let query;
	const queryParams = []
	if (!parentId) {parentId = 0;}
	query = `UPDATE expcats SET name = ? , parentId = ?, status = ? WHERE id = ? AND orgId = ?`
	queryParams.push(name)
	queryParams.push(parentId)
	queryParams.push(status)
	queryParams.push(id)
	queryParams.push(orgId)
    db_connection.query(query, queryParams, (err, results) => {
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
                message: 'Expense Category not found',
                dev: "Expense Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Expense Category updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name
            }
        })
    })
}

exports.deleteExpenseCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE expcats SET status = 'deleted' WHERE id = ? AND orgId = ?`;

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
                message: 'Expense Category not found',
                dev: "Expense Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Expense Category deleted successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.restoreExpenseCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE expcats SET status = 'active' WHERE id = ? AND orgId = ?`;

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
                message: 'Expense Category not found',
                dev: "Expense Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Expense Category restored successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.createIncomeCategory = (req, res) => {
    const { name, parentId } = req.body
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
	query = `INSERT INTO inccats (name, orgId, createdBy, status, parentId) VALUES (?, ?, ?, ?, ?)`
	parameters.push(name)
	parameters.push(orgId)
	parameters.push(createdBy)
	parameters.push('active')
	parameters.push(parentId)
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
            message: 'Income Category created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                orgId: orgId,
                createdBy: createdBy
            }
        })
    })
}

exports.detailIncomeCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The superadmin cannot access at the moment!"
        });
    }
    const id = req.params.id;
    const { num, type, page = 1, pageSize = 10, search } = req.query;
    const offset = (page - 1) * pageSize;

    let sqlQuery = `SELECT i.id, i.description, i.amount, i.incomeDate, i.catId, i.orgId, o.baseCurrency AS baseCurrency, u.name AS createdBy 
                    FROM incs i 
                    JOIN orgs o ON i.orgId=o.id 
                    JOIN users u ON i.createdBy=u.id 
                    WHERE catId = ?`;
    let queryParams = [id];

    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
				sqlQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
            			AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
			} else {
				sqlQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
				queryParams.push(num);
			}
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                sqlQuery += ` AND incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                sqlQuery += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                sqlQuery += ` AND incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                sqlQuery += ` AND incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
				if (parseInt(num) === 1) {
					sqlQuery += ` AND incomeDate >= CURDATE() AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
				} else {
					sqlQuery += ` AND incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
					queryParams.push(num);
				}
			}
        }
    }

    if (search) {
        sqlQuery += ` AND (i.description LIKE ? OR i.amount = ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, search);
    }

    sqlQuery += ` ORDER BY incomeDate DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(pageSize), offset);

    db_connection.query(sqlQuery, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: "Internal server error",
                error: err.message
            });
        }

        const totalNum = results.length;
        const totalAmt = results.reduce((total, item) => total + item.amount, 0);

        let countQuery = `SELECT COUNT(*) as total FROM incs WHERE catId = ?`;
        const countParams = [id];

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

        if (search) {
            countQuery += ` AND (description LIKE ? OR amount = ?)`;
            countParams.push(`%${search}%`, search);
        }

        db_connection.query(countQuery, countParams, (err, totalResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: "Internal server error",
                    error: err.message
                });
            }

            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / pageSize);

            if (total === 0) {
                return res.status(404).send({
                    success: false,
                    message: 'Data not found',
                    dev: "Data not found"
                });
            }

            res.status(200).send({
                success: true,
                message: 'Income Transaction list',
                dev: "Good Job, Bro!",
                data: results,
                totalNum: totalNum,
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

exports.getIncCat = (req, res) => {
	if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const {name} = req.params
	const orgId = req.user.orgId
    let query = `SELECT * FROM inccats WHERE inccats.name = '${name}' and inccats.orgId = ${orgId}`;

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

exports.getExpCat = (req, res) => {
	if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const {name} = req.params
	const orgId = req.user.orgId
    let query = `SELECT * FROM expcats WHERE expcats.name = '${name}' and orgId = ${orgId}`;

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

exports.getIncomeCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    let query = `SELECT * FROM inccats WHERE inccats.id = ${id}`;

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
            return res.status(200).send({
                success: true,
                message: "We found the data!",
                dev: "Thanks bro, you`re awesome",
                data: results[0]
            })
        })
    });
};

exports.updateIncomeCategory = (req, res) => {
    const { id } = req.params;
    let { name , parentId, status} = req.body;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    if (!name) {
        return res.status(400).send({ error: 'Name is required' });
    }
	if (!parentId) {parentId = 0;}
	let query;
	const queryParams = []
	query = `UPDATE inccats SET name = ? , parentId = ?, status = ? WHERE id = ? AND orgId = ?`
	queryParams.push(name)
	queryParams.push(parentId)
	queryParams.push(status)
	queryParams.push(id)
	queryParams.push(orgId)
    db_connection.query(query, queryParams, (err, results) => {
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
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name
            }
        })
    })
}


exports.deleteIncomeCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE inccats SET status = 'deleted' WHERE id = ? AND orgId = ?`;

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
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category deleted successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.restoreIncomeCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE inccats SET status = 'active' WHERE id = ? AND orgId = ?`;

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
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category restored successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.listIncomeCategory = (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        search,
        status,
        num,
        type
    } = req.query;
    
    const orgId = req.user.orgId;
    const offset = (page - 1) * pageSize;
    const queryParams = [];

    let query = `
        SELECT 
            ic.id, 
            ic.name,  
            ic.status,
            COALESCE(SUM(i.amount), 0) AS totalAmount,
            COUNT(i.id) AS totalTransactions
        FROM inccats ic
        LEFT JOIN incs i ON ic.id = i.catId
        WHERE ic.orgId = ?
    `;
    queryParams.push(orgId);

    if (search) {
        query += ` AND (ic.name LIKE ? )`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
    }

    if (status) {
        query += ` AND ic.status = ?`;
        queryParams.push(status);
    }

    // Date filtering logic for num and type
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                query += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                        AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
            } else {
                query += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                query += ` AND i.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                query += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                query += ` AND i.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                query += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
                if (parseInt(num) === 1) {
                    query += ` AND i.incomeDate >= CURDATE() AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    query += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    queryParams.push(num);
                }
            }
        }
    }

    query += `
        GROUP BY ic.id, ic.name, ic.status
        ORDER BY ic.id DESC
        LIMIT ? OFFSET ?
    `;
    queryParams.push(parseInt(pageSize));
    queryParams.push(offset);

    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            });
        }
		if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'categories not found',
                dev: "categories not found"
            })
        }

        const totalNum = results.length;
        const totalAmount = results.reduce((total, item) => total + item.totalAmount, 0);

        // Construct count query
        let countQuery = `
            SELECT COUNT(DISTINCT ic.id) AS total
            FROM inccats ic
            LEFT JOIN incs i ON ic.id = i.catId
            WHERE ic.orgId = ?
        `;
        const countParams = [orgId];

        if (search) {
            countQuery += ` AND (ic.name LIKE ? )`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern);
        }

        if (status) {
            countQuery += ` AND ic.status = ?`;
            countParams.push(status);
        }

        // Add date filter to the count query
        if (num && type && ["day", "week", "month"].includes(type)) {
            if (type === "week") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                            AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    countQuery += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                    countParams.push(num);
                }
            } else if (type === "month") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND i.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else if (parseInt(num) === -1) {
                    countQuery += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                    countQuery += ` AND i.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else {
                    countQuery += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                    countParams.push(num - 1);
                }
            } else {
                if (type === "day") {
                    if (parseInt(num) === 1) {
                        countQuery += ` AND i.incomeDate >= CURDATE() AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    } else {
                        countQuery += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                        countParams.push(num);
                    }
                }
            }
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
                message: 'Income Category list with transaction data',
                dev: "Good Job, Bro!",
                data: results,
                totalNum: totalNum,
                totalAmount: totalAmount,
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

exports.listAllCatsData = (req, res) => {
    const { fromDate, toDate, num, type, search } = req.query;

    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin tried to access category summary"
        });
    }

    const orgId = req.user.orgId;
    let incomeConditions = [];
    let expenseConditions = [];
    let incomeParams = [];
    let expenseParams = [];

    if (fromDate) {
        incomeConditions.push('i.incomeDate >= ?');
        expenseConditions.push('e.expenseDate >= ?');
        incomeParams.push(fromDate);
        expenseParams.push(fromDate);
    }

    if (toDate) {
        incomeConditions.push('i.incomeDate < ?');
        expenseConditions.push('e.expenseDate < ?');
        incomeParams.push(toDate);
        expenseParams.push(toDate);
    }

    if (num && type && ['day', 'week', 'month'].includes(type)) {
        const numValue = parseInt(num);
        
        if (type === 'day') {
            if (numValue === 1) {
                incomeConditions.push('i.incomeDate >= CURDATE() AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
                expenseConditions.push('e.expenseDate >= CURDATE() AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
            } else {
                incomeConditions.push('i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
                expenseConditions.push('e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
                incomeParams.push(numValue);
                expenseParams.push(numValue);
            }
        } else if (type === 'week') {
            if (numValue === 1) {
                incomeConditions.push('i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
                expenseConditions.push('e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
            } else {
                incomeConditions.push('i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)');
                expenseConditions.push('e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)');
                incomeParams.push(numValue);
                expenseParams.push(numValue);
            }
        } else if (type === 'month') {
            if (numValue === 1) {
                incomeConditions.push("i.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')");
                expenseConditions.push("e.expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')");
            } else if (numValue === -1) {
                incomeConditions.push("i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND i.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')");
                expenseConditions.push("e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND e.expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')");
            } else {
                incomeConditions.push("i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')");
                expenseConditions.push("e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')");
                incomeParams.push(numValue);
                expenseParams.push(numValue);
            }
        }
    }

    const incomeConditionStr = incomeConditions.length > 0 ? incomeConditions.join(' AND ') : '1=1';
    const expenseConditionStr = expenseConditions.length > 0 ? expenseConditions.join(' AND ') : '1=1';

    let searchCondition = '';
    let searchParams = [];
    
    if (search && search.trim()) {
        searchCondition = 'WHERE name LIKE ?';
        searchParams.push(`%${search.trim()}%`);
    }

    const query = `
        SELECT * FROM (
            SELECT
                ic.name AS name,
				ic.id AS id,
                SUM(CASE WHEN i.id IS NOT NULL AND (${incomeConditionStr}) THEN i.amount ELSE 0 END) AS totalSales,
                COUNT(CASE WHEN i.id IS NOT NULL AND (${incomeConditionStr}) THEN i.id ELSE NULL END) AS totalTransactions,
                o.baseCurrency,
                'income' AS type
            FROM inccats ic
            LEFT JOIN incs i ON ic.id = i.catId
            JOIN orgs o ON ic.orgId = o.id
            WHERE ic.orgId = ?
            GROUP BY ic.id, ic.name, o.baseCurrency

            UNION ALL

            SELECT
                ec.name AS name,
				ec.id AS id,
                SUM(CASE WHEN e.id IS NOT NULL AND (${expenseConditionStr}) THEN e.amount ELSE 0 END) AS totalSales,
                COUNT(CASE WHEN e.id IS NOT NULL AND (${expenseConditionStr}) THEN e.id ELSE NULL END) AS totalTransactions,
                o.baseCurrency,
                'expense' AS type
            FROM expcats ec
            LEFT JOIN exps e ON ec.id = e.catId
            JOIN orgs o ON ec.orgId = o.id
            WHERE ec.orgId = ?
            GROUP BY ec.id, ec.name, o.baseCurrency
        ) AS summary
        ${searchCondition}
        ORDER BY totalSales DESC
    `;

	const queryParams = [
        ...incomeParams,
        ...incomeParams,  
        orgId,
        ...expenseParams,
        ...expenseParams,
        orgId,
        ...searchParams
    ];
    
    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                dev: err
            });
        }

        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'No category data found',
                dev: "Category summary not found"
            });
        }

        res.status(200).send({
            success: true,
            message: 'Category summary loaded',
            dev: 'Categories with totalSales and transactions by date filter',
            data: results
        });
    });
};

function detailCatReport(req, res, catType) {
    const { num, type, fromDate, toDate } = req.query;
    
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        });
    }
    
    const orgId = req.user.orgId;
    const id = req.params.id;
    const queryParams = [];
    const dateType = catType === 'income' ? 'incomeDate' : 'expenseDate';
    const tableType = catType === 'income' ? 'inccats' : 'expcats';
    const table = catType === 'income' ? 'incs' : 'exps';
    
    let query = `
        SELECT
            ic.name AS name,
            DATE(i.${dateType}) AS transactionDate,
            SUM(i.amount) AS totalSales,
            COUNT(i.id) AS totalTransactions,
			'${catType}' AS type,
            o.baseCurrency AS baseCurrency
        FROM ${table} i
        JOIN ${tableType} ic ON i.catId = ic.id
        JOIN orgs o ON o.id = ?
        WHERE i.orgId = ? AND i.catId = ?
    `;
    
    queryParams.push(orgId);
    queryParams.push(orgId);
    queryParams.push(id);
    
    if (fromDate) {
        query += ` AND DATE(i.${dateType}) >= ?`;
        queryParams.push(fromDate);
    }
    
    if (toDate) {
        query += ` AND DATE(i.${dateType}) < ?`;
        queryParams.push(toDate);
    }
    
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                query += ` AND i.${dateType} >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
                          AND i.${dateType} < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)`;
            } else {
                query += ` AND i.${dateType} >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                query += ` AND i.${dateType} >= DATE_FORMAT(NOW(), '%Y-%m-01')
                          AND i.${dateType} < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)`;
            } else if (parseInt(num) === -1) {
                query += ` AND i.${dateType} >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
                          AND i.${dateType} < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                query += ` AND i.${dateType} >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else if (type === "day") {
            if (parseInt(num) === 1) {
                query += ` AND DATE(i.${dateType}) = CURDATE()`;
            } else {
                query += ` AND i.${dateType} >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                          AND i.${dateType} < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                queryParams.push(num);
            }
        }
    }
    
    query += `
        GROUP BY ic.id, ic.name, DATE(i.${dateType}), o.baseCurrency
        ORDER BY DATE(i.${dateType}) DESC, ic.name ASC
    `;
    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            });
        }
        
        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'data not found',
                dev: "data not found"
            });
        }
        
        res.status(200).send({
            success: true,
            message: 'Here is the data with total sales per day',
            dev: "Good Job, Bro!",
            data: results
        });
    });
}

exports.detailIncCatReport = (req, res) => {
    detailCatReport(req, res, 'income');
}

exports.detailExpCatReport = (req, res) => {
    detailCatReport(req, res, 'expense');
}