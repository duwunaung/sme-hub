const { query } = require('express')
const db_connection = require('../../../utils/connection')

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