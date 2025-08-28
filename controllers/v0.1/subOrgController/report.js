const db_connection = require('../../../utils/connection')
const moment = require('moment')

exports.getDetailReport = (req, res) => {
  const { num, type, fromDate, toDate } = req.query;
  
  if (req.user.orgId === 0) {
    return res.status(403).send({
      success: false,
      message: 'You cannot access at the moment, kindly contact admin team',
      dev: "The Superadmin tried to access Salespersons list"
    })
  }
  
  const orgId = req.user.orgId;
  const id = req.params.id;
  let queryParams = [];
  
  let startDateCondition = 'DATE(s.createdAt)';
  let endDateCondition = 'CURDATE()';
  let startParams = [];
  let endParams = [];
  
  if (fromDate && toDate) {
    startDateCondition = 'GREATEST(?, DATE(s.createdAt))';
    endDateCondition = '?';
    startParams.push(fromDate);
    endParams.push(toDate);
  } else if (fromDate) {
    startDateCondition = 'GREATEST(?, DATE(s.createdAt))';
    startParams.push(fromDate);
  } else if (toDate) {
    endDateCondition = '?';
    endParams.push(toDate);
  }
  else if (num && type && ["day", "week", "month"].includes(type)) {
    if (type === "day") {
      if (parseInt(num) === 1) {
        startDateCondition = 'GREATEST(CURDATE(), DATE(s.createdAt))';
        endDateCondition = 'CURDATE()';
      } else {
        startDateCondition = 'GREATEST(DATE_SUB(CURDATE(), INTERVAL ? DAY), DATE(s.createdAt))';
        endDateCondition = 'CURDATE()';
        startParams.push(parseInt(num) - 1);
      }
    } else if (type === "week") {
      if (parseInt(num) === 1) {
        startDateCondition = 'GREATEST(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), DATE(s.createdAt))';
        endDateCondition = 'CURDATE()';
      } else {
        startDateCondition = 'GREATEST(DATE_SUB(CURDATE(), INTERVAL ? WEEK), DATE(s.createdAt))';
        endDateCondition = 'CURDATE()';
        startParams.push(num);
      }
    } else if (type === "month") {
      if (parseInt(num) === 1) {
        startDateCondition = `GREATEST(DATE_FORMAT(CURDATE(), '%Y-%m-01'), DATE(s.createdAt))`;
        endDateCondition = 'CURDATE()';
      } else if (parseInt(num) === -1) {
        startDateCondition = `GREATEST(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'), DATE(s.createdAt))`;
        endDateCondition = `LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
      } else {
        startDateCondition = `GREATEST(DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL ? MONTH), DATE(s.createdAt))`;
        endDateCondition = 'CURDATE()';
        startParams.push(num);
      }
    }
  }
  
  queryParams = [
    ...startParams,
    id, orgId,           
    ...endParams,           
    orgId, id, orgId,     
    orgId                 
  ];
  
  let query = `
    WITH RECURSIVE date_range AS (
      SELECT 
        ${startDateCondition} AS date,
        ${endDateCondition} AS last_date
      FROM salesperson s
      WHERE s.id = ? AND s.orgId = ?
      UNION ALL
      SELECT 
        DATE_ADD(date, INTERVAL 1 DAY),
        last_date
      FROM date_range
      WHERE date < last_date
    ),
    salesperson_info AS (
      SELECT 
        s.id,
        s.name,
        s.createdAt,
        o.baseCurrency
      FROM salesperson s
      JOIN orgs o ON o.id = ?
      WHERE s.id = ? AND s.orgId = ?
    )
    SELECT
      si.name AS salespersonName,
      COALESCE(SUM(i.amount), 0) AS totalSales,
      COALESCE(COUNT(i.id), 0) AS totalTransactions,
      si.baseCurrency AS baseCurrency,
      dr.date AS date
    FROM date_range dr
    CROSS JOIN salesperson_info si
    LEFT JOIN incs i ON DATE(i.incomeDate) = dr.date 
      AND i.salespersonId = si.id 
      AND i.orgId = ?
    GROUP BY si.name, dr.date, si.baseCurrency
    ORDER BY dr.date DESC;
  `;
  
  db_connection.query(query, queryParams, (err, results) => {
    if (err) {
      console.log('Query:', query);
      console.log('Params:', queryParams);
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
      WITH RECURSIVE date_range AS (
        SELECT 
          DATE(CONCAT(?, '-', LPAD(?, 2, '0'), '-01')) AS date,
          LEAST(
            LAST_DAY(DATE(CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))), 
            CURDATE()
          ) AS last_date
        UNION ALL
        SELECT 
          DATE_ADD(date, INTERVAL 1 DAY),
          last_date
        FROM date_range
        WHERE date < last_date
      ),
      salesperson_info AS (
        SELECT 
          s.id,
          s.name,
          s.createdAt,
          o.baseCurrency
        FROM salesperson s
        JOIN orgs o ON o.id = ?
        WHERE s.id = ? AND s.orgId = ?
      )
      SELECT
        si.name AS salespersonName,
        COALESCE(SUM(i.amount), 0) AS totalSales,
        COALESCE(COUNT(i.id), 0) AS totalTransactions,
        si.baseCurrency AS baseCurrency,
        dr.date AS date
      FROM date_range dr
      CROSS JOIN salesperson_info si
      LEFT JOIN incs i ON DATE(i.incomeDate) = dr.date 
        AND i.salespersonId = si.id 
        AND i.orgId = ?
      WHERE dr.date >= DATE(si.createdAt)
      GROUP BY si.name, dr.date, si.baseCurrency
      ORDER BY dr.date DESC;
    `;
    queryParams = [year, month, year, month, orgId, id, orgId, orgId];
    
  } else if (filterType === 'months') {
    if (!year) {
      return res.status(400).send({
        success: false,
        message: "Year is required for months filter",
        dev: "Missing year parameter for months filter"
      });
    }
    
    query = `
      WITH RECURSIVE month_range AS (
        SELECT 
          1 AS month_num,
          ? AS year_num
        UNION ALL
        SELECT 
          month_num + 1,
          year_num
        FROM month_range
        WHERE month_num < 12
      ),
      salesperson_info AS (
        SELECT 
          s.id,
          s.name,
          s.createdAt,
          o.baseCurrency
        FROM salesperson s
        JOIN orgs o ON o.id = ?
        WHERE s.id = ? AND s.orgId = ?
      )
      SELECT
        si.name AS salespersonName,
        COALESCE(SUM(i.amount), 0) AS totalSales,
        COALESCE(COUNT(i.id), 0) AS totalTransactions,
        si.baseCurrency AS baseCurrency,
        mr.year_num AS year,
        mr.month_num AS month
      FROM month_range mr
      CROSS JOIN salesperson_info si
      LEFT JOIN incs i ON YEAR(i.incomeDate) = mr.year_num 
        AND MONTH(i.incomeDate) = mr.month_num
        AND i.salespersonId = si.id 
        AND i.orgId = ?
      WHERE DATE(CONCAT(mr.year_num, '-', LPAD(mr.month_num, 2, '0'), '-01')) >= DATE(si.createdAt)
      GROUP BY si.name, mr.year_num, mr.month_num, si.baseCurrency
      ORDER BY mr.year_num DESC, mr.month_num DESC;
    `;
    queryParams = [year, orgId, id, orgId, orgId];
    
  } else if (filterType === 'allyears') {
    query = `
      WITH RECURSIVE year_range AS (
        SELECT 
          YEAR(s.createdAt) AS year_num,
          YEAR(CURDATE()) AS max_year
        FROM salesperson s
        WHERE s.id = ? AND s.orgId = ?
        UNION ALL
        SELECT 
          year_num + 1,
          max_year
        FROM year_range
        WHERE year_num < max_year
      ),
      salesperson_info AS (
        SELECT 
          s.id,
          s.name,
          s.createdAt,
          o.baseCurrency
        FROM salesperson s
        JOIN orgs o ON o.id = ?
        WHERE s.id = ? AND s.orgId = ?
      )
      SELECT
        si.name AS salespersonName,
        COALESCE(SUM(i.amount), 0) AS totalSales,
        COALESCE(COUNT(i.id), 0) AS totalTransactions,
        si.baseCurrency AS baseCurrency,
        yr.year_num AS year
      FROM year_range yr
      CROSS JOIN salesperson_info si
      LEFT JOIN incs i ON YEAR(i.incomeDate) = yr.year_num
        AND i.salespersonId = si.id 
        AND i.orgId = ?
      GROUP BY si.name, yr.year_num, si.baseCurrency
      ORDER BY yr.year_num DESC;
    `;
    queryParams = [id, orgId, orgId, id, orgId, orgId];
    
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