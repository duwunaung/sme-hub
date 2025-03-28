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
                )
                SELECT 
                    days.date AS label,
                    COALESCE(SUM(incs.amount), 0) AS income,
                    COALESCE(SUM(exps.amount), 0) AS expense
                FROM days
                LEFT JOIN incs ON DATE(incs.incomeDate) = days.date AND incs.orgId = ?
                LEFT JOIN exps ON DATE(exps.expenseDate) = days.date AND exps.orgId = ?
                GROUP BY days.date
                ORDER BY days.date
            `,
            week: `
                WITH RECURSIVE weeks AS (
                    SELECT 
                        DATE_SUB(CURDATE(), INTERVAL 3 WEEK) AS start_date,
                        1 AS seq
                    UNION ALL
                    SELECT 
                        DATE_ADD(start_date, INTERVAL 1 WEEK),
                        seq + 1
                    FROM weeks
                    WHERE seq < 4
                )
                SELECT 
                    CONCAT('Week ', seq) AS label,
                    COALESCE(SUM(incs.amount), 0) AS income,
                    COALESCE(SUM(exps.amount), 0) AS expense
                FROM weeks
                LEFT JOIN incs ON 
                    incs.incomeDate >= weeks.start_date AND 
                    incs.incomeDate < DATE_ADD(weeks.start_date, INTERVAL 1 WEEK) AND 
                    incs.orgId = ?
                LEFT JOIN exps ON 
                    exps.expenseDate >= weeks.start_date AND 
                    exps.expenseDate < DATE_ADD(weeks.start_date, INTERVAL 1 WEEK) AND 
                    exps.orgId = ?
                GROUP BY weeks.start_date, seq
                ORDER BY weeks.start_date
            `,
            month: `
                WITH RECURSIVE months AS (
                    SELECT 
                        DATE_SUB(CURDATE(), INTERVAL 5 MONTH) AS month_date,
                        1 AS seq
                    UNION ALL
                    SELECT 
                        DATE_ADD(month_date, INTERVAL 1 MONTH),
                        seq + 1
                    FROM months
                    WHERE seq < 6
                )
                SELECT 
                    DATE_FORMAT(months.month_date, '%b') AS label,
                    COALESCE(SUM(incs.amount), 0) AS income,
                    COALESCE(SUM(exps.amount), 0) AS expense
                FROM months
                LEFT JOIN incs ON 
                    YEAR(incs.incomeDate) = YEAR(months.month_date) 
                    AND MONTH(incs.incomeDate) = MONTH(months.month_date)
                    AND incs.orgId = ?
                LEFT JOIN exps ON 
                    YEAR(exps.expenseDate) = YEAR(months.month_date) 
                    AND MONTH(exps.expenseDate) = MONTH(months.month_date)
                    AND exps.orgId = ?
                GROUP BY months.month_date
                ORDER BY months.month_date
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
