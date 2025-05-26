const db_connection = require('../../utils/connection')
const moment = require('moment')

exports.barchartDashboard = async (req, res) => {
    try {
        const orgId = req.user.orgId;

        const queries = {
            day: `
                WITH RECURSIVE days AS (
                    SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY) AS date
                    UNION ALL
                    SELECT DATE_ADD(date, INTERVAL 1 DAY)
                    FROM days
                    WHERE date < CURDATE()
                ),
                daily_income AS (
                    SELECT DATE(incomeDate) AS date, SUM(amount) AS total_income
                    FROM incs 
                    WHERE orgId = ?
                    GROUP BY DATE(incomeDate)
                ),
                daily_expense AS (
                    SELECT DATE(expenseDate) AS date, SUM(amount) AS total_expense
                    FROM exps
                    WHERE orgId = ?
                    GROUP BY DATE(expenseDate)
                )
                SELECT 
                    days.date AS label,
                    COALESCE(daily_income.total_income, 0) AS income,
                    COALESCE(daily_expense.total_expense, 0) AS expense
                FROM days
                LEFT JOIN daily_income ON daily_income.date = days.date
                LEFT JOIN daily_expense ON daily_expense.date = days.date
                ORDER BY days.date
            `,
            week: `
                WITH RECURSIVE weeks AS (
                    SELECT 
                        DATE_SUB(CURDATE(), INTERVAL 3 WEEK) AS start_date,
                        DATE_ADD(DATE_SUB(CURDATE(), INTERVAL 3 WEEK), INTERVAL 6 DAY) AS end_date,
                        1 AS seq
                    UNION ALL
                    SELECT 
                        DATE_ADD(start_date, INTERVAL 1 WEEK),
                        DATE_ADD(end_date, INTERVAL 1 WEEK),
                        seq + 1
                    FROM weeks
                    WHERE seq < 4
                )
                SELECT 
                    CONCAT('Week ', w.seq) AS label,
                    COALESCE(i.total_income, 0) AS income,
                    COALESCE(e.total_expense, 0) AS expense
                FROM weeks w
                LEFT JOIN (
                    SELECT 
                        w2.seq,
                        SUM(i.amount) AS total_income
                    FROM weeks w2
                    LEFT JOIN incs i ON 
                        i.incomeDate >= w2.start_date AND 
                        i.incomeDate <= w2.end_date AND 
                        i.orgId = ?
                    GROUP BY w2.seq
                ) i ON i.seq = w.seq
                LEFT JOIN (
                    SELECT 
                        w3.seq,
                        SUM(e.amount) AS total_expense
                    FROM weeks w3
                    LEFT JOIN exps e ON 
                        e.expenseDate >= w3.start_date AND 
                        e.expenseDate <= w3.end_date AND 
                        e.orgId = ?
                    GROUP BY w3.seq
                ) e ON e.seq = w.seq
                ORDER BY w.seq
            `,
            month: `
                WITH RECURSIVE months AS (
                    SELECT 
                        DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01') AS month_start,
                        LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 5 MONTH)) AS month_end,
                        1 AS seq
                    UNION ALL
                    SELECT 
                        DATE_FORMAT(DATE_ADD(month_start, INTERVAL 1 MONTH), '%Y-%m-01'),
                        LAST_DAY(DATE_ADD(month_start, INTERVAL 1 MONTH)),
                        seq + 1
                    FROM months
                    WHERE seq < 6
                )
                SELECT 
                    DATE_FORMAT(m.month_start, '%b') AS label,
                    COALESCE(i.total_income, 0) AS income,
                    COALESCE(e.total_expense, 0) AS expense
                FROM months m
                LEFT JOIN (
                    SELECT 
                        m2.seq,
                        SUM(i.amount) AS total_income
                    FROM months m2
                    LEFT JOIN incs i ON 
                        i.incomeDate >= m2.month_start AND 
                        i.incomeDate <= m2.month_end AND 
                        i.orgId = ?
                    GROUP BY m2.seq
                ) i ON i.seq = m.seq
                LEFT JOIN (
                    SELECT 
                        m3.seq,
                        SUM(e.amount) AS total_expense
                    FROM months m3
                    LEFT JOIN exps e ON 
                        e.expenseDate >= m3.month_start AND 
                        e.expenseDate <= m3.month_end AND 
                        e.orgId = ?
                    GROUP BY m3.seq
                ) e ON e.seq = m.seq
                ORDER BY m.seq
            `
        };

        const results = {};
        for (const [period, query] of Object.entries(queries)) {
            const [periodResults] = await db_connection.promise().query(query, [orgId, orgId]);
            
            results[period] = {
                labels: periodResults.map(row => row.label),
                income: periodResults.map(row => row.income),
                expense: periodResults.map(row => row.expense)
            };
        }

        return res.status(200).send({
            success: true,
            message: 'Expense and income categories totals fetched successfully',
            data: results
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: 'Internal server error',
            dev: error.message
        });
    }
};

exports.dashboard = (req, res) => {
    const { num, type } = req.query;
	const orgId = req.user.orgId;
	const queryParams = [orgId];
	const incomeParams = [orgId];

	let incSql = `
	SELECT 
	    c.name AS category_name, 
	    SUM(i.amount) AS total_amount
	FROM 
	    incs i
	JOIN 
	    inccats c ON i.catId = c.id
	WHERE 
	    i.orgId = ?
	`;
	if (num && type && ["day", "week", "month"].includes(type)) {
	    if (type === "week") {
	        if (parseInt(num) === 1) {
	            incSql += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
	                     AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	        } else {
	            incSql += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
	            incomeParams.push(parseInt(num));
	        }
	    } else if (type === "month") {
	        if (parseInt(num) === 1) {
	            incSql += ` AND i.incomeDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
	        } else if (parseInt(num) === -1) {
	            incSql += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
	                     AND i.incomeDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
	        } else {
	            incSql += ` AND i.incomeDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
	            incomeParams.push(parseInt(num) - 1);
	        }
	    } else if (type === "day") {
	        if (parseInt(num) === 1) {
	            incSql += ` AND i.incomeDate >= CURDATE() AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	        } else {
	            incSql += ` AND i.incomeDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND i.incomeDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	            incomeParams.push(parseInt(num));
	        }
	    }
	}
	incSql += `
	GROUP BY 
	    c.name
	ORDER BY 
	    total_amount DESC
	`;

	let expSql = `
	SELECT 
	    c.name AS category_name, 
	    SUM(e.amount) AS total_amount
	FROM 
	    exps e
	JOIN 
	    expcats c ON e.catId = c.id
	WHERE 
	    e.orgId = ?
	`;
	if (num && type && ["day", "week", "month"].includes(type)) {
	    if (type === "week") {
	        if (parseInt(num) === 1) {
	            expSql += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
	                     AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	        } else {
	            expSql += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? WEEK)`;
	            queryParams.push(parseInt(num));
	        }
	    } else if (type === "month") {
	        if (parseInt(num) === 1) {
	            expSql += ` AND e.expenseDate >= DATE_FORMAT(NOW(), '%Y-%m-01')`;
	        } else if (parseInt(num) === -1) {
	            expSql += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
	                     AND e.expenseDate < DATE_FORMAT(NOW(), '%Y-%m-01')`;
	        } else {
	            expSql += ` AND e.expenseDate >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL ? MONTH), '%Y-%m-01')`;
	            queryParams.push(parseInt(num) - 1);
	        }
	    } else if (type === "day") {
	        if (parseInt(num) === 1) {
	            expSql += ` AND e.expenseDate >= CURDATE() AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	        } else {
	            expSql += ` AND e.expenseDate >= DATE_SUB(CURDATE(), INTERVAL ? DAY) AND e.expenseDate < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;
	            queryParams.push(parseInt(num));
	        }
	    }
	}
	expSql += `
	GROUP BY 
	    c.name
	ORDER BY 
	    total_amount DESC
	`;

	db_connection.query(expSql, queryParams, (err, results) => {
	    if (err) {
	        return res.status(500).send({
	            success: false,
	            message: 'Internal server error',
	            dev: err
	        });
		}
		db_connection.query(incSql, incomeParams, (err, incResults) => {
			if (err) {
				return res.status(500).send({
					success: false,
					message: 'Internal server error',
					dev: err
				});
			}
			return res.status(200).send({
				success: true,
				message: 'Expense and income categories totals fetched successfully',
				data: {
					expenseData: results,
					incomeData: incResults
				}
			});
		})
	});	
}

exports.overviewDashboard = (req, res) => {
  const orgId = req.user.orgId;

  const cashQuery = `
    SELECT 
      (IFNULL((SELECT SUM(amount) FROM incs WHERE orgId = ?), 0) -
       IFNULL((SELECT SUM(amount) FROM exps WHERE orgId = ?), 0)) AS cashInHand
  `;

  const incomeQuery = `
    SELECT description, incomeDate, amount 
    FROM incs 
    WHERE orgId = ? 
    ORDER BY incomeDate DESC 
    LIMIT 5
  `;

  const expenseQuery = `
    SELECT description, expenseDate, amount 
    FROM exps 
    WHERE orgId = ? 
    ORDER BY expenseDate DESC 
    LIMIT 5
  `;

  // Execute all queries
  db_connection.query(cashQuery, [orgId, orgId], (err, cashResult) => {
    if (err) {
      return res.status(500).send({
        success: false,
        message: 'Internal server error on cash query',
        dev: err
      });
    }

    db_connection.query(incomeQuery, [orgId], (err, incomeResults) => {
      if (err) {
        return res.status(500).send({
          success: false,
          message: 'Internal server error on income query',
          dev: err
        });
      }

      db_connection.query(expenseQuery, [orgId], (err, expenseResults) => {
        if (err) {
          return res.status(500).send({
            success: false,
            message: 'Internal server error on expense query',
            dev: err
          });
        }

        // Final response
        res.status(200).send({
          success: true,
          message: 'Overview dashboard data fetched successfully',
          dev: "Good Job, Bro!",
          data: {
            cashInHand: cashResult[0].cashInHand,
            incomeTrans: incomeResults,
            expenseTrans: expenseResults
          }
        });
      });
    });
  });
};

