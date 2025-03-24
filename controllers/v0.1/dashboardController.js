const db_connection = require('../../utils/connection')
const moment = require('moment')

exports.dashboard = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    // Queries
    let expiredQuery = `SELECT 
                            months.month,
                            IFNULL(COUNT(o.id), 0) AS expired_organizations
                        FROM 
                            (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
                             SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL 
                             SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS months
                        LEFT JOIN orgs o 
                            ON MONTH(o.expiredDate) = months.month 
                            AND YEAR(o.expiredDate) = YEAR(CURDATE()) - IF(months.month <= MONTH(CURDATE()), 0, 1)
                        GROUP BY months.month
                        ORDER BY months.month DESC;`;

    let newOrgQuery = `SELECT 
                            months.month,
                            IFNULL(COUNT(o.id), 0) AS new_organizations
                        FROM 
                            (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
                             SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL 
                             SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS months
                        LEFT JOIN orgs o 
                            ON MONTH(o.registeredDate) = months.month 
                            AND YEAR(o.registeredDate) = YEAR(CURDATE()) - IF(months.month <= MONTH(CURDATE()), 0, 1)
                        GROUP BY months.month
                        ORDER BY months.month DESC;`;

	let sixMonTrans = `
						SELECT 
						    dates.month_name,
						    COALESCE(exp_counts.expense_count, 0) AS expense_count,
						    COALESCE(inc_counts.income_count, 0) AS income_count,
						    COALESCE(exp_counts.expense_count, 0) + COALESCE(inc_counts.income_count, 0) AS total_count
						FROM (
						    SELECT 
						        DATE_FORMAT(CURRENT_DATE - INTERVAL (m-1) MONTH, '%Y-%m') AS month,
						        DATE_FORMAT(CURRENT_DATE - INTERVAL (m-1) MONTH, '%b %Y') AS month_name
						    FROM (
						        SELECT 1 AS m UNION SELECT 2 UNION SELECT 3
						        UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
						    ) months
						) dates
						LEFT JOIN (
						    SELECT 
						        DATE_FORMAT(expenseDate, '%Y-%m') AS month,
						        COUNT(*) AS expense_count
						    FROM exps
						    WHERE expenseDate >= DATE_FORMAT(CURRENT_DATE - INTERVAL 5 MONTH, '%Y-%m-01')
						    GROUP BY DATE_FORMAT(expenseDate, '%Y-%m')
						) exp_counts ON dates.month = exp_counts.month
						LEFT JOIN (
						    SELECT 
						        DATE_FORMAT(incomeDate, '%Y-%m') AS month,
						        COUNT(*) AS income_count
						    FROM incs
						    WHERE incomeDate >= DATE_FORMAT(CURRENT_DATE - INTERVAL 5 MONTH, '%Y-%m-01')
						    GROUP BY DATE_FORMAT(incomeDate, '%Y-%m')
						) inc_counts ON dates.month = inc_counts.month
						ORDER BY dates.month;	
					`

	let sevenDayTrans = `
						SELECT 
						    dates.date,
						    dates.day_name,
						    COALESCE(exp_counts.expense_count, 0) AS expense_count,
						    COALESCE(inc_counts.income_count, 0) AS income_count,
						    COALESCE(exp_counts.expense_count, 0) + COALESCE(inc_counts.income_count, 0) AS total_count
						FROM (
						    SELECT 
						        DATE(CURRENT_DATE - INTERVAL (d-1) DAY) AS date,
						        DATE_FORMAT(CURRENT_DATE - INTERVAL (d-1) DAY, '%a') AS day_name
						    FROM (
						        SELECT 1 AS d UNION SELECT 2 UNION SELECT 3
						        UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7
						    ) days
						) dates
						LEFT JOIN (
						    SELECT 
						        DATE(expenseDate) AS date,
						        COUNT(*) AS expense_count
						    FROM exps
						    WHERE expenseDate >= CURRENT_DATE - INTERVAL 6 DAY
						    GROUP BY DATE(expenseDate)
						) exp_counts ON dates.date = exp_counts.date
						LEFT JOIN (
						    SELECT 
						        DATE(incomeDate) AS date,
						        COUNT(*) AS income_count
						    FROM incs
						    WHERE incomeDate >= CURRENT_DATE - INTERVAL 6 DAY
						    GROUP BY DATE(incomeDate)
						) inc_counts ON dates.date = inc_counts.date
						ORDER BY dates.date;
						`
	let orgByCountry = `
						SELECT baseCountry, COUNT(*) AS org_count
						FROM orgs
						GROUP BY baseCountry
						ORDER BY org_count DESC;
						`

    db_connection.query(expiredQuery, (err, expiredResults) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'Error fetching expired organizations data',
                error: err
            });
        }

        db_connection.query(newOrgQuery, (err, newOrgResults) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'Error fetching new organizations data',
                    error: err
                });
            }

			db_connection.query(sixMonTrans, (err, sixMonTransResult) => {
				if (err) {
					return res.status(500).send({
						success: false,
						message: 'Error fetching last six months transactions data',
						error: err
					});
				}
				db_connection.query(sevenDayTrans, (err, sevenDayTransResult) => {
					if (err) {
						return res.status(500).send({
							success: false,
							message: 'Error fetching last seven days transactions data',
							error: err
						});
					}
					db_connection.query(orgByCountry, (err, orgByCountryResult) => {
						if (err) {
							return res.status(500).send({
								success: false,
								message: 'Error fetching organizations by country data',
								error: err
							});
						}
						return res.status(200).send({
							success: true,
							message: 'Dashboard data fetched successfully',
							data: {
								new_organizations: newOrgResults,
								expired_organizations: expiredResults,
								six_month_transactions: sixMonTransResult,
								seven_day_transactions: sevenDayTransResult,
								org_by_country: orgByCountryResult
							}
						});
					})
				})

			})
        });
    });
}
