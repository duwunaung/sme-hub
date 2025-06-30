const db_connection = require('../../../utils/connection')
const moment = require('moment')

exports.getDetailReport = (req, res) => {
	const { num,type, fromDate, toDate, } = req.query;
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
    const orgId = req.user.orgId;
	const id = req.params.id
    const queryParams = [];

    let query = `
		    SELECT 
			  s.name AS salespersonName,
			  SUM(i.amount) AS totalSales,
			  COUNT(i.id) AS totalTransactions,
			  o.baseCurrency AS baseCurrency,
			  i.incomeDate AS date
			FROM incs i
			JOIN salesperson s ON i.salespersonId = s.id
			JOIN orgs o ON o.id = ?
			WHERE i.orgId = ? AND i.salespersonId = ?
    `;

	queryParams.push(orgId);
    queryParams.push(orgId);
	queryParams.push(id);

	if (fromDate) {
        query += ` AND i.incomeDate >= ?`;
        queryParams.push(fromDate);
    }
    if (toDate) {
        query += ` AND i.incomeDate < ?`;
        queryParams.push(toDate);
    }

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
	    GROUP BY s.name, i.incomeDate
		ORDER BY i.incomeDate DESC;
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
                message: 'data not found',
                dev: "data not found"
            })
        }
        
        res.status(200).send({
            success: true,
            message: 'Here is the data with total sales',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.getDetailsReportTrans = (req, res) => {
	const { search, num,type, fromDate, toDate, } = req.query;
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access Salespersons list"
        })
    }
    const orgId = req.user.orgId;
	const id = req.params.id
    const queryParams = [];

    let query = `
		    SELECT 
			  s.name AS salespersonName,
			  i.amount AS totalSales,
			  i.itemName,
			  i.quantity,
			  o.baseCurrency AS baseCurrency,
			  i.incomeDate
			FROM incs i
			JOIN salesperson s ON i.salespersonId = s.id
			JOIN orgs o ON o.id = ?
			WHERE i.orgId = ? AND i.salespersonId = ?
    `;

	queryParams.push(orgId);
    queryParams.push(orgId);
	queryParams.push(id);

	if (fromDate) {
        query += ` AND i.incomeDate >= ?`;
        queryParams.push(fromDate);
    }
    if (toDate) {
        query += ` AND i.incomeDate < ?`;
        queryParams.push(toDate);
    }
	if (search) {
		query += ` AND (i.itemName LIKE ? )`;
		const searchPattern = `%${search}%`;
		queryParams.push(searchPattern);
	}

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
		ORDER BY i.incomeDate DESC;
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
                message: 'data not found',
                dev: "data not found"
            })
        }
        
        res.status(200).send({
            success: true,
            message: 'Here is the data with total sales',
            dev: "Good Job, Bro!",
            data: results
        })
    })
}

exports.getDetailsReport = (req, res) => {
  const { filterType, month, year } = req.query;
  
  if (req.user.orgId === 0) {
    return res.status(403).send({
      success: false,
      message: 'You cannot access at the moment, kindly contact admin team',
      dev: "The Superadmin tried to access Salespersons list"
    })
  }
  
  if (!filterType) {
    return res.status(403).send({
      success: false,
      message: "cannot make request!",
      dev: "can't make request at this moment!"
    })
  }
  
  const orgId = req.user.orgId;
  const id = req.params.id;
  let queryParams = [];
  let query = '';
  
  if (filterType === 'days') {
    if (!month || !year) {
      return res.status(400).send({
        success: false,
        message: "Month and year are required for days filter",
        dev: "Missing month or year parameter for days filter"
      });
    }
    
    query = `
      SELECT
        s.name AS salespersonName,
        SUM(i.amount) AS totalSales,
        COUNT(i.id) AS totalTransactions,
        o.baseCurrency AS baseCurrency,
        DATE(i.incomeDate) AS date
      FROM incs i
      JOIN salesperson s ON i.salespersonId = s.id
      JOIN orgs o ON o.id = ?
      WHERE i.orgId = ? AND i.salespersonId = ? AND YEAR(i.incomeDate) = ? AND MONTH(i.incomeDate) = ?
      GROUP BY s.name, DATE(i.incomeDate)
      ORDER BY DATE(i.incomeDate) DESC;
    `;
    
    queryParams = [orgId, orgId, id, year, month];
    
  } else if (filterType === 'months') {
    if (!year) {
      return res.status(400).send({
        success: false,
        message: "Year is required for months filter",
        dev: "Missing year parameter for months filter"
      });
    }
    
    query = `
      SELECT
	    s.name AS salespersonName,
	    SUM(i.amount) AS totalSales,
	    COUNT(i.id) AS totalTransactions,
	    o.baseCurrency AS baseCurrency,
	    YEAR(i.incomeDate) AS year,
	    MONTH(i.incomeDate) AS month
	  FROM incs i
	  JOIN salesperson s ON i.salespersonId = s.id
	  JOIN orgs o ON o.id = ?
	  WHERE i.orgId = ? AND i.salespersonId = ? AND YEAR(i.incomeDate) = ?
	  GROUP BY YEAR(i.incomeDate), MONTH(i.incomeDate)
	  ORDER BY YEAR(i.incomeDate) DESC, MONTH(i.incomeDate) DESC;
    `;
    
    queryParams = [orgId, orgId, id, year];
    
  } else if (filterType === 'allyears') {
    query = `
      SELECT
        s.name AS salespersonName,
        SUM(i.amount) AS totalSales,
        COUNT(i.id) AS totalTransactions,
        o.baseCurrency AS baseCurrency,
        YEAR(i.incomeDate) AS year
      FROM incs i
      JOIN salesperson s ON i.salespersonId = s.id
      JOIN orgs o ON o.id = ?
      WHERE i.orgId = ? AND i.salespersonId = ?
      GROUP BY s.name, YEAR(i.incomeDate)
      ORDER BY YEAR(i.incomeDate) DESC;
    `;
    
    queryParams = [orgId, orgId, id];
    
  } else {
    return res.status(400).send({
      success: false,
      message: "Invalid filter type. Use 'days', 'months', or 'allyears'",
      dev: "Invalid filterType parameter"
    });
  }
  
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
        message: 'data not found',
        dev: "data not found"
      });
    }
    
    res.status(200).send({
      success: true,
      message: 'Here is the data with total sales',
      dev: "Good Job, Bro!",
      data: results
    });
  });
};