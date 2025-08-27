const db_connection = require('../../../utils/connection')
const moment = require('moment')

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

exports.listAllTrans = (req, res) => {
    const { fromDate, toDate, num, type, search } = req.query;
    const orgId = req.user.orgId;
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
        baseSQL += ` AND transactionDate < ?`;
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
    
    const dataSQL = baseSQL + ` ORDER BY transactionDate DESC`;
    const dataParams = [...queryParams];

    db_connection.query(dataSQL, dataParams, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                dev: err
            });
        }
        
        return res.status(200).send({
            success: true,
            message: 'All transactions fetched successfully',
            data: results
        });
    });
};
