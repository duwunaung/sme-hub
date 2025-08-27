const { query } = require('express')
const db_connection = require('../../../utils/connection')

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