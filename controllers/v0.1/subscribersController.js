const axios = require('axios');

exports.login = (req, res) => {
	if (req.method === 'POST') {
		const { email, password } = req.body;
		try {
			axios.post(`${process.env.API_URL}/subscribers/login`, { email, password })
				.then(response => {
					if (response.data.success) {
						req.session.token = response.data.data.token;
						req.session.user = response.data.data.user.name;
						req.session.orgName = response.data.data.user.orgName;
						res.redirect('/subscriber/home');
					} else {
						res.render('subscriber/login', { errorMessage: response.data.message });
					}
				})
				.catch(error => {
					res.render('subscriber/login', { errorMessage: error.response.data.message });
				})
		} catch (error) {
			res.render('subscriber/login', { errorMessage: 'An error occurred during login.' });
		}
	} else {
		res.render('subscriber/login', { errorMessage: null })
	}

}

exports.logout = (req, res) => {
	if (req.session) {
		req.session.destroy(err => {
			if (err) {
				return res.redirect('/'); // Redirect to home on error
			}
			res.redirect('login'); // Redirect to login after successful logout
		});
	} else {
		res.redirect('login'); // If no session, redirect to login
	}
}

exports.listExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		axios.get(`${process.env.API_URL}/subscribers/categories/expense/list`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const options = [
				{ id: 1, name: 'active' },
				{ id: 2, name: 'deleted' }
			];
			res.render('subscriber/categories', { organizationName: req.session.orgName,category: response.data.data, cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
			
		}).catch(error => {
			res.render('subscriber/categories', { organizationName: req.session.orgName,category: [], options: [], cat: "expense", pagination: {}, errorMessage: "System Error!", successMessage: null });
		})
	}
}

exports.createExpenseCat = (req, res) => {
	if (req.method == 'POST') {

		const { name } = req.body;
		axios.post(`${process.env.API_URL}/subscribers/categories/expense/create`, { name }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/category/expense'  )
		}).catch(error => {
			res.redirect('/subscriber/category/expense')
		})
	}
}

exports.restoreExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const orgId = req.params.id

		axios.put(`${process.env.API_URL}/subscribers/categories/expense/restore/${orgId}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/expense')
		}).catch(error => {
			res.redirect('/subscriber/category/expense')
		})
	}
}

exports.deleteExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id

		axios.delete(`${process.env.API_URL}/subscribers/categories/expense/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/expense')
		}).catch(error => {
			res.redirect('/subscriber/category/expense')
		})
	}
}

exports.updateExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const options = [
			{ id: 1, name: 'active' },
			{ id: 2, name: 'deleted' }
		];
		axios.get(`${process.env.API_URL}/subscribers/categories/expense/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			
			res.render('subscriber/categories-edit', { organizationName: req.session.orgName,category: response.data.data, options: options, errorMessage: null, successMessage: null });
		}).catch(error => {
			res.render('subscriber/categories-edit', {organizationName: req.session.orgName, category: {}, options: options, errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const { name } = req.body;
		axios.put(`${process.env.API_URL}/subscribers/categories/expense/${id}`, { name }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/expense/update/' + id + '?success=true&type=update&cat=expense')
		}).catch(error => {
			res.redirect('/subscriber/category/expense/update/' + id + '?error=true&type=sysError&cat=expense');
		})
	}
}

exports.detailExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const {num, type, search } = req.query
		let url_api = `${process.env.API_URL}/subscribers/categories/expense/detail/${id}`
		const queryParams = [];
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/expense/${id}`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/categories-detail', {organizationName: req.session.orgName, category: responseCategory.data.data, transaction: response.data.data, cat: "expense", errorMessage: null, successMessage: null });
			}).catch(error => {
				res.render('subscriber/categories-detail', { organizationName: req.session.orgName, transaction: [], category: {}, errorMessage: "System Error!", cat: "expense", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/categories-detail', { organizationName: req.session.orgName, transaction: [], category: {}, errorMessage: "System Error!", cat: "expense", successMessage: null });         
		})
	}
}

exports.listIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		axios.get(`${process.env.API_URL}/subscribers/categories/income/list`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const options = [
				{ id: 1, name: 'active' },
				{ id: 2, name: 'deleted' }
			];
			res.render('subscriber/categories', {organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
			
		}).catch(error => {
			res.render('subscriber/categories', {organizationName: req.session.orgName, category: [], options: [] , cat: "income", pagination: {}, errorMessage: "System Error!", successMessage: null });
		})
	}
}

exports.createIncomeCat = (req, res) => {
	if (req.method == 'POST') {

		const { name } = req.body;
		axios.post(`${process.env.API_URL}/subscribers/categories/income/create`, { name }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/category/income'  )
		}).catch(error => {
			res.redirect('/subscriber/category/income')
		})
	}
}

exports.restoreIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const orgId = req.params.id

		axios.put(`${process.env.API_URL}/subscribers/categories/income/restore/${orgId}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/income')
		}).catch(error => {
			res.redirect('/subscriber/category/income')
		})
	}
}

exports.deleteIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id

		axios.delete(`${process.env.API_URL}/subscribers/categories/income/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/income')
		}).catch(error => {
			res.redirect('/subscriber/category/income')
		})
	}
}

exports.updateIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const options = [
			{ id: 1, name: 'active' },
			{ id: 2, name: 'deleted' }
		];
		axios.get(`${process.env.API_URL}/subscribers/categories/income/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.render('subscriber/categories-edit', {organizationName: req.session.orgName, category: response.data.data, options: options, errorMessage: null, successMessage: null });
		}).catch(error => {
			res.render('subscriber/categories-edit', {organizationName: req.session.orgName, category: {}, options: options, errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const { name } = req.body;
		axios.put(`${process.env.API_URL}/subscribers/categories/income/${id}`, { name }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/income/update/' + id + '?success=true&type=update&cat=income')
		}).catch(error => {
			res.redirect('/subscriber/category/income/update/' + id + '?error=true&type=sysError&cat=income');
		})
	}
}

exports.detailIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const {num, type, search } = req.query
		let url_api = `${process.env.API_URL}/subscribers/categories/income/detail/${id}`
		const queryParams = [];
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/income/${id}`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/categories-detail', {organizationName: req.session.orgName, category: responseCategory.data.data, transaction: response.data.data, cat: "income", errorMessage: null, successMessage: null });
			}).catch(error => {
				res.render('subscriber/categories-detail', { organizationName: req.session.orgName, transaction: [], category: {}, errorMessage: "System Error!", cat: "income", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/categories-detail', { organizationName: req.session.orgName, transaction: [], category: {}, errorMessage: "System Error!", cat: "income", successMessage: null });         
		})
	}
}

exports.listExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const {num, type, search, catId } = req.query
		let url_api = `${process.env.API_URL}/subscribers/expenses`
		const queryParams = [];
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (catId) {
			queryParams.push(`catId=${catId}`);
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/expense/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction', {organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data, transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
			}).catch(error => {
				res.render('subscriber/transaction', { organizationName: req.session.orgName, trans: "expense", category: [], transaction: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction', { organizationName: req.session.orgName, trans: "expense", category: [], transaction: [],  pagination: {}, errorMessage: "System Error!", successMessage: null });
		})
	}
}

exports.createExpenseTrans = (req, res) => {
	if (req.method == 'POST') {

		const { description, amount, expenseDate, catId } = req.body;
		axios.post(`${process.env.API_URL}/subscribers/expenses/create`, { description, amount, expenseDate, catId }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/transaction/income')
		}).catch(error => {
			res.redirect('/subscriber/transaction/income')
		})
	}
}

exports.createExpenseTrans = (req, res) => {
	if (req.method == 'POST') {
		
		const { description, amount, expenseDate, catId } = req.body;
		axios.post(`${process.env.API_URL}/subscribers/expenses/create`, { description, amount, expenseDate, catId }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/transaction/expense')
		}).catch(error => {
			res.redirect('/subscriber/transaction/expense')
		})
	}
}

exports.updateExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.get(`${process.env.API_URL}/subscribers/expenses/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/expense/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction-edit', { organizationName: req.session.orgName,trans: "expense", transaction: response.data.data, category: responseCategory.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
			}).catch(error => {
				res.render('subscriber/transaction-edit', {organizationName: req.session.orgName, trans: "expense", transaction: {}, category: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-edit', { organizationName: req.session.orgName,trans: "expense", transaction: {}, category: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const cat = req.query.cat
		const categoryId = req.query.id
		const { description, amount, expenseDate, catId } = req.body;
		axios.put(`${process.env.API_URL}/subscribers/expenses/update/${id}`, { description, amount, expenseDate, catId }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			if (cat && categoryId){
				res.redirect('/subscriber/transaction/expense/update/' + id + `?success=true&type=update&cat=expense&id=${categoryId}`)
			} else {
				res.redirect('/subscriber/transaction/expense/update/' + id + '?success=true&type=update&trans=expense')
			}
		}).catch(error => {
			res.redirect('/subscriber/transaction/expense/update/' + id + '?error=true&type=sysError&trans=expense');
		})
	}
}

exports.detailExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.get(`${process.env.API_URL}/subscribers/expenses/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/expense/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction-detail', {organizationName: req.session.orgName, category: responseCategory.data.data ,transaction: response.data.data, trans: "expense", errorMessage: null, successMessage: null });
			}).catch(error => {
				res.render('subscriber/transaction-detail', {organizationName: req.session.orgName, category: [], transaction: {}, errorMessage: "System Error!", trans: "expense", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-detail', {organizationName: req.session.orgName, category: [], transaction: {}, errorMessage: "System Error!", trans: "expense", successMessage: null });         
		})
	}
}

exports.listIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const {num, type, search, catId } = req.query
		let url_api = `${process.env.API_URL}/subscribers/incomes`
		const queryParams = [];
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (catId) {
			queryParams.push(`catId=${catId}`);
		}
		if (queryParams.length > 0) {
			url_api += `?${queryParams.join('&')}`;
		}
		axios.get(url_api, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/income/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction', {organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
			}).catch(error => {
				res.render('subscriber/transaction', { organizationName: req.session.orgName, trans: "income", category: [], transaction: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction', { organizationName: req.session.orgName, trans: "income", category: [], transaction: [],  pagination: {}, errorMessage: "System Error!", successMessage: null });
		})
	}
}

exports.createIncomeTrans = (req, res) => {
	if (req.method == 'POST') {
		const { description, amount, incomeDate, catId } = req.body;
		axios.post(`${process.env.API_URL}/subscribers/incomes/create`, { description, amount, incomeDate, catId }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/transaction/income')
		}).catch(error => {
			res.redirect('/subscriber/transaction/income')
		})
	}
}

exports.updateIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.get(`${process.env.API_URL}/subscribers/incomes/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/income/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction-edit', {organizationName: req.session.orgName,trans: "income", transaction: response.data.data, category: responseCategory.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
			}).catch(error => {
				res.render('subscriber/transaction-edit', {organizationName: req.session.orgName,trans: "income",  transaction: {}, category: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-edit', {organizationName: req.session.orgName, trans: "income", transaction: {}, category: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const cat = req.query.cat
		const categoryId = req.query.id
		const { description, amount, incomeDate, catId } = req.body;
		axios.put(`${process.env.API_URL}/subscribers/incomes/update/${id}`, { description, amount, incomeDate, catId }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			if (cat && categoryId){
				res.redirect('/subscriber/transaction/income/update/' + id + `?success=true&type=update&cat=income&id=${categoryId}`)
			} else {
				res.redirect('/subscriber/transaction/income/update/' + id + '?success=true&type=update&trans=income')
			}
		}).catch(error => {
			res.redirect('/subscriber/transaction/income/update/' + id + '?error=true&type=sysError&trans=income');
		})
	}
}

exports.detailIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.get(`${process.env.API_URL}/subscribers/incomes/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			axios.get(`${process.env.API_URL}/subscribers/categories/income/list`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				res.render('subscriber/transaction-detail', {organizationName: req.session.orgName, category: responseCategory.data.data , transaction: response.data.data, trans: "income", errorMessage: null, successMessage: null });
			}).catch(error => {
				res.render('subscriber/transaction-detail', { organizationName: req.session.orgName,category: [], transaction: {}, errorMessage: "System Error!", trans: "income", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-detail', { organizationName: req.session.orgName,category: [], transaction: {}, errorMessage: "System Error!", trans: "income", successMessage: null });         
		})
	}
}