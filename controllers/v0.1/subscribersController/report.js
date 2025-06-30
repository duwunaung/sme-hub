const axios = require('axios');
const e = require('express');
const { use, param } = require('../../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;
const exportCsvResponse = require('../../../utils/exportCsv');

const formatTransactionData = (transactions) => {
  return transactions.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.amount);
    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();

    const formattedDate = txn.transactionDate && txn.transactionDate.trim() !== ''
      ? new Date(txn.transactionDate).toLocaleString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        })
      : '';

    return {
      id: index + 1,
      description: txn.description,
      amount: currencySymbol,
      transactionDate: formattedDate,
      category: txn.category,
      createdBy: txn.createdBy,
      baseCurrency: txn.baseCurrency,
      transactionType: txn.transactionType
    };
  });
};

const formatDataBySales = (data) => {
  return data.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.totalSales);
    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();

    return {
      id: index + 1,
	  name: txn.name,
      totalSales: currencySymbol,
	  totalTransactions: txn.totalTransactions,
      baseCurrency: txn.baseCurrency
    };
  });
};

const formatDataByCat = (data) => {
  return data.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.totalSales);
    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();

    return {
      id: index + 1,
	  name: txn.name,
      totalSales: currencySymbol,
	  totalTransactions: txn.totalTransactions,
      baseCurrency: txn.baseCurrency,
	  type: txn.type
    };
  });
};

const formatDataByCatDetail = (data) => {
  return data.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.totalSales);
    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();
	const formattedDate = txn.transactionDate && txn.transactionDate.trim() !== ''
      ? new Date(txn.transactionDate).toLocaleString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      : '';

    return {
      id: index + 1,
	  name: txn.name,
	  transactionDate: formattedDate,
      totalSales: currencySymbol,
	  totalTransactions: txn.totalTransactions,
      baseCurrency: txn.baseCurrency,
	  type: txn.type
    };
  });
};

const formatDataBySalesDetail = (data) => {
  return data.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.totalSales);

    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();

    let formattedDate = '';
    if (txn.incomeDate && txn.incomeDate.trim() !== '') {
      formattedDate = new Date(txn.incomeDate).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } else if (txn.date && txn.date.trim() !== '') {
      formattedDate = new Date(txn.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (txn.year && txn.month) {
      const tempDate = new Date(`${txn.year}-${txn.month}-01`);
      formattedDate = tempDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    } else if (txn.year) {
      formattedDate = txn.year.toString();
    }

    return {
      id: index + 1,
      name: txn.salespersonName,
      totalSales: currencySymbol,
      totalTransactions: txn.totalTransactions,
      date: formattedDate,
      baseCurrency: txn.baseCurrency
    };
  });
};

const formatDataBySalesDetailTrans = (data) => {
  return data.map((txn, index) => {
    const formattedAmount = new Intl.NumberFormat('en-US').format(txn.totalSales);

    const currencySymbol = (() => {
      switch (txn.baseCurrency) {
        case 'USD': return `$ ${formattedAmount}`;
        case 'MMK': return `${formattedAmount} ks`;
        case 'THB': return `฿ ${formattedAmount}`;
        default: return formattedAmount;
      }
    })();

    let formattedDate = '';
    if (txn.incomeDate && txn.incomeDate.trim() !== '') {
      formattedDate = new Date(txn.incomeDate).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } else if (txn.date && txn.date.trim() !== '') {
      formattedDate = new Date(txn.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } else if (txn.year && txn.month) {
      const tempDate = new Date(`${txn.year}-${txn.month}-01`);
      formattedDate = tempDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    } else if (txn.year) {
      formattedDate = txn.year.toString();
    }

    return {
      id: index + 1,
      name: txn.salespersonName,
      totalSales: currencySymbol,
      date: formattedDate,
      baseCurrency: txn.baseCurrency,
	  itemName: txn.itemName,
	  quantity: txn.quantity
    };
  });
};

exports.reportMainPage = (req, res) => {
	if (req.method === 'GET') {
		const { num, type, from, to, export: exportCsv } = req.query;
		let transactionsUrl = `${process.env.API_URL}/subscribers/transactions/all`;
		const queryParams = [];

		if (num) queryParams.push(`num=${num}`);
		if (type) queryParams.push(`type=${type}`);
		if (from) queryParams.push(`fromDate=${from}`);
		if (to) queryParams.push(`toDate=${to}`);

		if (queryParams.length > 0) {
			transactionsUrl += `?${queryParams.join('&')}`;
		}

		axios.get(transactionsUrl, { headers: { 'Authorization': `${req.session.token}` } })
			.then(transactionsRes => {
				const data = transactionsRes.data.data;

				if (exportCsv === 'true') {
					if (!data || data.length === 0) {
						res.render('subscriber/report', {
							userName: req.session.user,
							userRole: req.session.role,
							baseCurrency: req.session.baseCurrency,
							logo: req.session.orgLogo,
							organizationName: req.session.orgName,
							trans: 'all',
							category: [],
							salesperson: [],
							transaction: data,
							errorMessage: "No data is found to be exported!",
							successMessage: null
						});
					}
					const formattedData = formatTransactionData(data)
					exportCsvResponse(res, formattedData, "transactions-report");
					return;
				}

				res.render('subscriber/report', {
					userName: req.session.user,
					userRole: req.session.role,
					baseCurrency: req.session.baseCurrency,
					logo: req.session.orgLogo,
					organizationName: req.session.orgName,
					trans: 'all',
					category: [],
					salesperson: [],
					transaction: data,
					errorMessage: null,
					successMessage: null
				});
			})
			.catch(error => {
				res.render('subscriber/report', {
					userName: req.session.user,
					userRole: req.session.role,
					baseCurrency: req.session.baseCurrency,
					logo: req.session.orgLogo,
					organizationName: req.session.orgName,
					trans: 'all',
					category: [],
					salesperson: [],
					transaction: [],
					errorMessage: 'System Error!',
					successMessage: null
				});
			});
	}
};


exports.reportSalesPage = (req, res) => {
	if (req.method == 'GET') {
		const { search , num, type, from, to, export: exportCsv} = req.query
		let url_api = `${process.env.API_URL}/subscribers/salesperson/listall`
		const queryParams = [];
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (num) {
			queryParams.push(`num=${num}`)
		}
		if (type) {
			queryParams.push(`type=${type}`)
		}
		if (from) {
			queryParams.push(`fromDate=${from}`)
		}
		if (to) {
			queryParams.push(`toDate=${to}`)
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const options = [
				{ id: 1, name: 'active' },
				{ id: 2, name: 'deleted' }
			];

			const data = response.data.data;

			if (exportCsv === 'true') {
				if (!data || data.length === 0) {
					res.render('subscriber/salesreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: [], options: [] , errorMessage: "The report cannot be exported!", successMessage: null });
				}
				const formattedData = formatDataBySales(data)
				exportCsvResponse(res, formattedData, "report-by-salesperson");
				return ;
			}
			res.render('subscriber/salesreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data , options: options, errorMessage: null , successMessage: null});
		}).catch(error => {
			if (error.status === 404) {
				res.render('subscriber/salesreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: [], options: [] , errorMessage: null, successMessage: null });
			} else {
				res.render('subscriber/salesreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: [], options: [] , errorMessage: "System Error!", successMessage: null });
			}
		})
	}
}

exports.reportSalesDetailTransPage = async (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const { search, num, type, from, to, export: exportCsv } = req.query
		
		let salespersonName = "Salesperson";
		try {
			salespersonName = await fetchSalespersonName(id, req.session.token);
		} catch (nameError) {
			salespersonName = "Salesperson"
		}
		try {
			let url_api = `${process.env.API_URL}/subscribers/salesperson/detailreporttrans/${id}`
			const queryParams = [];
			if (search) {
				queryParams.push(`search=${search}`)
			}
			if (num) {
				queryParams.push(`num=${num}`)
			}
			if (type) {
				queryParams.push(`type=${type}`)
			}
			if (from) {
				queryParams.push(`fromDate=${from}`)
			}
			if (to) {
				queryParams.push(`toDate=${to}`)
			}
			if (queryParams.length > 0) {
				url_api += `?${queryParams.join('&')}`;
			}
			
			const response = await axios.get(url_api, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			});
			
			const data = response.data.data;
			const formattedData = formatDataBySalesDetailTrans(data)

			if (exportCsv === 'true') {
				if (!data || data.length === 0) {
					return res.render('subscriber/salesdetailtransrep', {
						userName: req.session.user, 
						userRole: req.session.role,
						baseCurrency: req.session.baseCurrency, 
						logo: req.session.orgLogo,
		                organizationName: req.session.orgName,
						report: data,
						salespersonId: id,
						salespersonName: salespersonName,
						errorMessage: "No data found for the selected criteria!",
						successMessage: null
		        	});
				}
				return exportCsvResponse(res, formattedData, "report-by-salesperson-detail");
			}
			
			res.render('subscriber/salesdetailtransrep', {
				userName: req.session.user, 
				userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
				report: data,
				salespersonId: id,
				salespersonName: salespersonName,
				errorMessage: null,
				successMessage: null
        	});			
		} catch (reportError) {
			let errorMessage = "Internal System Error!";
			
			if (reportError.response) {
				switch (reportError.response.status) {
					case 404:
						errorMessage = null;
						break;
					case 403:
						errorMessage = "Access denied. You don't have permission to view this report!";
						break;
					case 401:
						errorMessage = "Authentication failed. Please login again!";
						break;
					case 500:
						errorMessage = "Server error occurred while fetching report data!";
						break;
					default:
						errorMessage = `Error: ${reportError.response.status} - ${reportError.response.statusText}`;
				}
			} else if (reportError.request) {
				errorMessage = "Network error. Please check your connection!";
			}
			
			res.render('subscriber/salesdetailtransrep', {
				userName: req.session.user, 
				userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
				report: [],
				salespersonId: id,
				salespersonName: salespersonName,
				errorMessage: errorMessage,
				successMessage: null
        	});
		}
	}
}

exports.reportSalesDetailPage = async (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const { num, type, from, to, export: exportCsv , filterType, yearDay, monthDay, yearMonth } = req.query
		
		let salespersonName = "Salesperson";
		try {
			salespersonName = await fetchSalespersonName(id, req.session.token);
		} catch (nameError) {
			salespersonName = "Salesperson"
		}
		try {
			if (filterType === 'days' || filterType === 'months' || filterType === 'allyears') {
				let url_api = `${process.env.API_URL}/subscribers/salesperson/detailreports/${id}`
				const queryParams = [];
				if (filterType === 'days'){
					queryParams.push(`month=${monthDay}`)
					queryParams.push(`year=${yearDay}`)
				} else if (filterType === 'months') {
					queryParams.push(`year=${yearMonth}`)
				} else {
					queryParams.push(`year=all`)
				}
				queryParams.push(`filterType=${filterType}`)
				if (queryParams.length > 0) {
					url_api += `?${queryParams.join('&')}`;
				}
				
				const response = await axios.get(url_api, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				});
				
				const data = response.data.data;
				const formattedData = formatDataBySalesDetail(data)

				if (exportCsv === 'true') {
					if (!data || data.length === 0) {
						return res.render('subscriber/salesdetailrep', {
							userName: req.session.user, 
							userRole: req.session.role,
							baseCurrency: req.session.baseCurrency, 
							logo: req.session.orgLogo,
			                organizationName: req.session.orgName,
							report: data,
							salespersonId: id,
							salespersonName: salespersonName,
							errorMessage: "No data found for the selected period!",
							successMessage: null
			        	});
					}
					return exportCsvResponse(res, formattedData, "report-by-salesperson-detail");
				}
				
				res.render('subscriber/salesdetailrep', {
					userName: req.session.user, 
					userRole: req.session.role,
					baseCurrency: req.session.baseCurrency, 
					logo: req.session.orgLogo,
	                organizationName: req.session.orgName,
					report: data,
					salespersonId: id,
					salespersonName: salespersonName,
					errorMessage: null,
					successMessage: null
	        	});
				
			} else {
				let url_api = `${process.env.API_URL}/subscribers/salesperson/detailreport/${id}`
				const queryParams = [];
				if (num) {
					queryParams.push(`num=${num}`)
				}
				if (type) {
					queryParams.push(`type=${type}`)
				}
				if (from) {
					queryParams.push(`fromDate=${from}`)
				}
				if (to) {
					queryParams.push(`toDate=${to}`)
				}
				if (queryParams.length > 0) {
					url_api += `?${queryParams.join('&')}`;
				}
				
				const response = await axios.get(url_api, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				});
				
				const data = response.data.data;
				const formattedData = formatDataBySalesDetail(data)

				if (exportCsv === 'true') {
					if (!data || data.length === 0) {
						return res.render('subscriber/salesdetailrep', {
							userName: req.session.user, 
							userRole: req.session.role,
							baseCurrency: req.session.baseCurrency, 
							logo: req.session.orgLogo,
			                organizationName: req.session.orgName,
							report: data,
							salespersonId: id,
							salespersonName: salespersonName,
							errorMessage: "No data found for the selected criteria!",
							successMessage: null
			        	});
					}
					return exportCsvResponse(res, formattedData, "report-by-salesperson-detail");
				}
				
				res.render('subscriber/salesdetailrep', {
					userName: req.session.user, 
					userRole: req.session.role,
					baseCurrency: req.session.baseCurrency, 
					logo: req.session.orgLogo,
	                organizationName: req.session.orgName,
					report: data,
					salespersonId: id,
					salespersonName: salespersonName,
					errorMessage: null,
					successMessage: null
	        	});
			}
			
		} catch (reportError) {
			let errorMessage = "Internal System Error!";
			
			if (reportError.response) {
				switch (reportError.response.status) {
					case 404:
						errorMessage = null;
						break;
					case 403:
						errorMessage = "Access denied. You don't have permission to view this report!";
						break;
					case 401:
						errorMessage = "Authentication failed. Please login again!";
						break;
					case 500:
						errorMessage = "Server error occurred while fetching report data!";
						break;
					default:
						errorMessage = `Error: ${reportError.response.status} - ${reportError.response.statusText}`;
				}
			} else if (reportError.request) {
				errorMessage = "Network error. Please check your connection!";
			}
			
			res.render('subscriber/salesdetailrep', {
				userName: req.session.user, 
				userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
				report: [],
				salespersonId: id,
				salespersonName: salespersonName,
				errorMessage: errorMessage,
				successMessage: null
        	});
		}
	}
}

async function fetchSalespersonName(salespersonId, token) {
	try {
		const response = await axios.get(`${process.env.API_URL}/subscribers/salesperson/${salespersonId}`, {
			headers: {
				'Authorization': token
			}
		});
		return response.data.data.name || response.data.name || `Salesperson ID: ${salespersonId}`;
		
	} catch (error) {
		if (error.response) {
			switch (error.response.status) {
				case 404:
					return `Salesperson ID: ${salespersonId}`;
				case 403:
					return "Access Restricted";
				case 401:
					return "Authentication Required";
				default:
					return "Salesperson";
			}
		}
		
		return "Salesperson";
	}
}

exports.reportCatPage = (req, res) => {
	if (req.method == 'GET') {
		const { search , num, type, from, to, export: exportCsv} = req.query
		let url_api = `${process.env.API_URL}/subscribers/categories/listall`
		const queryParams = [];
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (num) {
			queryParams.push(`num=${num}`)
		}
		if (type) {
			queryParams.push(`type=${type}`)
		}
		if (from) {
			queryParams.push(`fromDate=${from}`)
		}
		if (to) {
			queryParams.push(`toDate=${to}`)
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const data = response.data.data;
			if (exportCsv === 'true') {
				if (!data || data.length === 0) {
					res.render('subscriber/catreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [],  errorMessage: "The report cannot be exported!", successMessage: null });
				}
				const formattedData = formatDataByCat(data)
				exportCsvResponse(res, formattedData, "report-by-category");
				return ;
			}
			res.render('subscriber/catreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , errorMessage: null , successMessage: null});
		}).catch(error => {
			console.log(error)
			if (error.status === 404) {
				res.render('subscriber/catreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [],  errorMessage: null, successMessage: null });
			} else {
				res.render('subscriber/catreport', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [],  errorMessage: "System Error!", successMessage: null });
			}
		})
	}
}

exports.reportDatePage = (req, res) => {
	if (req.method == 'GET') {
        // let url = `${process.env.API_URL}/subscribers/report/date`;
        // axios.get(url, { headers: { 'Authorization': `${req.session.token}` } })
        // .then(result => {
        //     res.render('subscriber/report', {userName: req.session.user, userRole: req.session.role,
		// 		baseCurrency: req.session.baseCurrency, 
		// 		logo: req.session.orgLogo,
        //         organizationName: req.session.orgName,
        //     });
        // })
        // .catch(error => {
        //     res.render('subscriber/report', {userName: req.session.user, userRole: req.session.role,
		// 		baseCurrency: req.session.baseCurrency, 
		// 		logo: req.session.orgLogo,
        //         organizationName: req.session.orgName,
        //     });
        // });
		res.render('subscriber/datereport', {userName: req.session.user, userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
				errorMessage: null,
				successMessage: null
        });
    }
}

function reportCatDetail (req, res, url_api) {
	const { search , num, type, from, to, export: exportCsv} = req.query
	const queryParams = [];
	if (search) {
		queryParams.push(`search=${search}`);
	}
	if (num) {
		queryParams.push(`num=${num}`)
	}
	if (type) {
		queryParams.push(`type=${type}`)
	}
	if (from) {
		queryParams.push(`fromDate=${from}`)
	}
	if (to) {
		queryParams.push(`toDate=${to}`)
	}
	if (queryParams.length > 0) {
		url_api += `?${queryParams.join('&')}`;
	}
	console.log(url_api)
	axios.get(url_api, {
		headers: {
			'Authorization': `${req.session.token}`
		}
	}).then(response => {
		const data = response.data.data;
		console.log(data)
		if (exportCsv === 'true') {
			if (!data || data.length === 0) {
				res.render('subscriber/catreportdetail', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], errorMessage: "The report cannot be exported!", successMessage: null });
			}
			const formattedData = formatDataByCatDetail(data)
			exportCsvResponse(res, formattedData, "report-by-category-detail");
			return ;
		}
		res.render('subscriber/catreportdetail', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , errorMessage: null , successMessage: null});
	}).catch(error => {
		if (error.status === 404) {
			res.render('subscriber/catreportdetail', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [],  errorMessage: null, successMessage: null });
		} else {
			res.render('subscriber/catreportdetail', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], errorMessage: "System Error!", successMessage: null });
		}
	})
}

exports.reportCatIncDetailPage = (req, res) => {
	if (req.method == 'GET') {
		const {id} = req.params
		let url_api = `${process.env.API_URL}/subscribers/categories/income/detail/report/${id}`
		reportCatDetail(req, res, url_api)
	}
}

exports.reportCatExpDetailPage = (req, res) => {
	if (req.method == 'GET') {
		const {id} = req.params
		let url_api = `${process.env.API_URL}/subscribers/categories/expense/detail/report/${id}`
		console.log(url_api)
		reportCatDetail(req, res, url_api)
	}
}