const db_connection = require('../../../utils/connection')
const moment = require('moment')

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
                message: 'Data not found salesperson',
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


exports.getSalespersonListAll = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
    const orgId = req.user.orgId;
    const queryParams = [];
    let query = ` SELECT * FROM salesperson WHERE orgId = ? AND status = ? `;

    queryParams.push(orgId);
	queryParams.push('active')
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

        return res.status(200).send({
            success: true,
            message: 'Here is the Salesperson list',
            dev: "Good Job, Bro!",
            data: results
        })
    })
};

// exports.getSalesListAll = (req, res) => {
// 	const { 
//         search,
//         num,
//         type,
// 		fromDate,
// 		toDate,
//     } = req.query;
//     if (req.user.orgId === 0) {
//         return res.status(403).send({
//             success: false,
//             message: 'You cannot access at the moment, kindly contact admin team',
//             dev: "The Superadmin tried to access Salespersons list"
//         })
//     }
//     const orgId = req.user.orgId;
//     const queryParams = [];

//     let query = `
//     SELECT
//         s.id,
//         s.name,
//         COALESCE(SUM(t.amount), 0) AS totalSales,
//         COUNT(t.id) AS totalTransactions
//     FROM
//         salesperson s
//     LEFT JOIN
//         incs t ON s.id = t.salespersonId
//     WHERE
//         s.orgId = ?
//     `;

//     queryParams.push(orgId);

//     if (search) {
//         query += ` AND (s.name LIKE ? )`;
//         const searchPattern = `%${search}%`;
//         queryParams.push(searchPattern);
//     }
// 	if (fromDate) {
//         query += ` AND t.incomeDate >= ?`;
//         queryParams.push(fromDate);
//     }
//     if (toDate) {
//         query += ` AND t.incomeDate < ?`;
//         queryParams.push(toDate);
//     }
//     // Date filtering logic for num and type
//     if (num && type && ["day", "week", "month"].includes(type)) {
//         if (type === "week") {
//             if (parseInt(num) === 1) {
//                 query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
//                         AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
//             } else {
//                 query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
//                 queryParams.push(num);
//             }
//         } else if (type === "month") {
//             if (parseInt(num) === 1) {
//                 query += ` AND t.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
//             } else if (parseInt(num) === -1) {
//                 query += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
//                 query += ` AND t.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
//             } else {
//                 query += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
//                 queryParams.push(num - 1);
//             }
//         } else {
//             if (type === "day") {
//                 if (parseInt(num) === 1) {
//                     query += ` AND t.incomeDate >= CURDATE() AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
//                 } else {
//                     query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
//                     queryParams.push(num);
//                 }
//             }
//         }
//     }

//     query += `
// 		GROUP BY s.id, s.name
// 		ORDER BY totalSales DESC
//     `;

//     db_connection.query(query, queryParams, (err, results) => {
//         if (err) {
// 			console.log(err)
//             return res.status(500).send({
//                 success: false,
//                 message: 'internal server error',
//                 dev: err
//             })
//         }

//         if (results.length === 0) {
//             return res.status(404).send({
//                 success: false,
//                 message: 'Salespersons not found',
//                 dev: "Salespersons not found"
//             })
//         }

//         res.status(200).send({
//             success: true,
//             message: 'Here is the Salesperson list with total sales',
//             dev: "Good Job, Bro!",
//             data: results
//         })
//     })
// }

exports.getSalesListAll = (req, res) => {
    const {
        search,
        num,
        type,
        fromDate,
        toDate,
    } = req.query;
    
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
    
    const orgId = req.user.orgId;
    const queryParams = [];
    
    let joinConditions = ['s.id = t.salespersonId'];
    
    if (fromDate) {
        joinConditions.push('t.incomeDate >= ?');
        queryParams.push(fromDate);
    }
    
    if (toDate) {
        joinConditions.push('t.incomeDate < ?');
        queryParams.push(toDate);
    }
    
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                joinConditions.push(`t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)`);
                joinConditions.push(`t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`);
            } else {
                joinConditions.push(`t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`);
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                joinConditions.push(`t.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`);
            } else if (parseInt(num) === -1) {
                joinConditions.push(`t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`);
                joinConditions.push(`t.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`);
            } else {
                joinConditions.push(`t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`);
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
                if (parseInt(num) === 1) {
                    joinConditions.push(`t.incomeDate >= CURDATE()`);
                    joinConditions.push(`t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`);
                } else {
                    joinConditions.push(`t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`);
                    joinConditions.push(`t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`);
                    queryParams.push(num);
                }
            }
        }
    }
    
	let query = `
				SELECT
				    s.id,
				    s.name,
				    COALESCE(SUM(t.amount), 0) AS totalSales,
				    COUNT(t.id) AS totalTransactions,
				    o.baseCurrency
				FROM
				    salesperson s
				LEFT JOIN
				    incs t ON ${joinConditions.join(' AND ')}
				LEFT JOIN
				    orgs o ON s.orgId = o.id
				WHERE
				    s.orgId = ?
	`;
    
    queryParams.push(orgId);
    
    if (search) {
        query += ` AND (s.name LIKE ?)`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
    }
    
    query += `
        GROUP BY s.id, s.name
        ORDER BY totalSales DESC
    `;
    
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
        
        res.status(200).send({
            success: true,
            message: 'Here is the Salesperson list with total sales',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.getSalespersonList = (req, res) => {
    const { 
        page = 1, 
        pageSize = 10, 
        search,
        num,
        type
    } = req.query;
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
    const offset = (page - 1) * pageSize;
    const orgId = req.user.orgId;
    const queryParams = [];

    let query = `
    SELECT
        s.id,
        s.name,
        s.status,
        COALESCE(SUM(t.amount), 0) AS totalSales,
        COUNT(t.id) AS totalTransactions
    FROM
        salesperson s
    LEFT JOIN
        incs t ON s.id = t.salespersonId
    WHERE
        s.orgId = ?
    `;

    queryParams.push(orgId);

    if (search) {
        query += ` AND (s.name LIKE ? )`;
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern);
    }

    // Date filtering logic for num and type
    if (num && type && ["day", "week", "month"].includes(type)) {
        if (type === "week") {
            if (parseInt(num) === 1) {
                query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                        AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
            } else {
                query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                queryParams.push(num);
            }
        } else if (type === "month") {
            if (parseInt(num) === 1) {
                query += ` AND t.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else if (parseInt(num) === -1) {
                query += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                query += ` AND t.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
            } else {
                query += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                queryParams.push(num - 1);
            }
        } else {
            if (type === "day") {
                if (parseInt(num) === 1) {
                    query += ` AND t.incomeDate >= CURDATE() AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    query += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    queryParams.push(num);
                }
            }
        }
    }

    query += `
    GROUP BY s.id, s.name, s.status
    ORDER BY totalSales DESC
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
        const totalSales = results.reduce((total, item) => total + item.totalSales, 0);

        // Construct count query
        let countQuery = `
        SELECT COUNT(DISTINCT s.id) AS total
        FROM salesperson s
        LEFT JOIN incs t ON s.id = t.salespersonId
        WHERE s.orgId = ?
        `;

        const countParams = [orgId];

        if (search) {
            countQuery += ` AND (s.name LIKE ? )`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern);
        }

        // Add date filter to the count query
        if (num && type && ["day", "week", "month"].includes(type)) {
            if (type === "week") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) 
                            AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                } else {
                    countQuery += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
                    countParams.push(num);
                }
            } else if (type === "month") {
                if (parseInt(num) === 1) {
                    countQuery += ` AND t.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else if (parseInt(num) === -1) {
                    countQuery += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')`;
                    countQuery += ` AND t.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
                } else {
                    countQuery += ` AND t.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
                    countParams.push(num - 1);
                }
            } else {
                if (type === "day") {
                    if (parseInt(num) === 1) {
                        countQuery += ` AND t.incomeDate >= CURDATE() AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
                    } else {
                        countQuery += ` AND t.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND t.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
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
                message: 'Here is the Salesperson list with total sales',
                dev: "Good Job, Bro!",
                data: results,
                totalNum: totalNum,
                totalSales: totalSales,
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