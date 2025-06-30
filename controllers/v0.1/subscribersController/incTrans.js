const axios = require('axios');
const e = require('express');
const { use, param } = require('../../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;
const exportCsvResponse = require('../../../utils/exportCsv');

exports.listIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const {num, type, search, catId } = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		let url_api = `${process.env.API_URL}/subscribers/incomes`
		const queryParams = [];
		if (page) {
			queryParams.push(`page=${page}`);
		}
		if (pageSize) {
			queryParams.push(`pageSize=${pageSize}`);
		}
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
			axios.get(`${process.env.API_URL}/subscribers/categories/income`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				axios.get(`${process.env.API_URL}/subscribers/salesperson/all`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseSalesperson => {
					const success = req.query.success
					const type = req.query.type
					const error = req.query.error
					if (success === 'true') {
						if (type === 'create') {
							res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, salesperson: responseSalesperson.data.data ,transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: "Successfully Created!"});
						}
					} else {
						if (type === 'fileError') {
							res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data,salesperson: responseSalesperson.data.data , transaction: response.data.data, pagination: response.data.pagination, errorMessage: `Only image file (${photoSize} MB maximum) can be uploaded!` , successMessage: null});
						} else {
							res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data,salesperson: responseSalesperson.data.data , transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
						}
					}
				}).catch(err => {
					if (err.status === 404) {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: response.data.data, pagination: {},salesperson: [] , errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: response.data.data, pagination: {},salesperson: [] , errorMessage: "System Error!", successMessage: null });
					}
				})
			}).catch(error => {
				res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: [], transaction: response.data.data, pagination: {}, salesperson: [] ,errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			axios.get(`${process.env.API_URL}/subscribers/categories/income`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				axios.get(`${process.env.API_URL}/subscribers/salesperson/all`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseSalesperson => {
					if (error.status === 404) {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], salesperson: responseSalesperson.data.data , pagination: {}, errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], salesperson: responseSalesperson.data.data , pagination: {}, errorMessage: "System Error!", successMessage: null });
					}
				}).catch(err => {
					if (err.status === 404) {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], salesperson: [] , pagination: {}, errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], salesperson: [] , pagination: {}, errorMessage: "System Error!", successMessage: null });
					}
				})
			}).catch(error => {
				if (error.status === 404) {
					res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: [], transaction: [], salesperson: [] , pagination: {}, errorMessage: null, successMessage: null });
				} else {
					res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: [], transaction: [], salesperson: [] , pagination: {}, errorMessage: "System Error!", successMessage: null });
				}
			})
			
		})
	}
}

exports.createIncomeTrans = (req, res) => {
	if (req.method == 'POST') {
	  const { description, amount, incomeDate, catId, itemName, price, quantity, salesperson, customer, salespersonName, salespersonNameNew } = req.body;
	  if (req.fileError) {
		res.redirect('/subscriber/transaction/income?error=true&type=fileError')
		return ;
	  }
	  const receipt = req.file ? req.file.filename : null;
	  let parameters = { incomeDate, catId };
	  
	  const createIncome = (updatedSalesperson, updatedSalespersonName) => {
		if (description) {
		  parameters.description = description;
		  parameters.amount = amount;
		} else {
		  parameters.itemName = itemName;
		  parameters.price = price;
		  parameters.quantity = quantity;
		  parameters.salespersonId = updatedSalesperson || salesperson;
		  parameters.customer = customer;
		  const amount = parseInt(price) * parseInt(quantity);
		  parameters.amount = `${amount}`;
		  const finalSalespersonName = updatedSalespersonName || salespersonName;
		  let description = finalSalespersonName + " has sold " + quantity + " " + itemName;
		  if (customer)
			description = description + " to " + customer;
		  parameters.description = description;
		}
		
		if (receipt) {
		  parameters.receipt = receipt;
		}
		
		axios.post(`${process.env.API_URL}/subscribers/incomes/create`, parameters, {
		  headers: {
			'Authorization': `${req.session.token}`
		  }
		}).then(response => {
		  res.redirect('/subscriber/transaction/income?success=true&type=create');
		}).catch(error => {
		  res.redirect('/subscriber/transaction/income?error=true&type=sysError');
		});
	  };
	  
	  if (salespersonNameNew) {
		axios.post(`${process.env.API_URL}/subscribers/salesperson/create`, { name: salespersonNameNew }, {
		  headers: {
			'Authorization': `${req.session.token}`
		  }
		}).then(responseAddNewSalesperson => {
		  const name = responseAddNewSalesperson.data.data.name;
		  
		  axios.get(`${process.env.API_URL}/subscribers/salesperson/list/${name}`, {
			headers: {
			  'Authorization': `${req.session.token}`
			}
		  }).then(resSalepersonId => {
			const newSalespersonId = resSalepersonId.data.data.id;
			const newSalespersonName = resSalepersonId.data.data.name;
			
			createIncome(newSalespersonId, newSalespersonName);
		  }).catch(errId => {
			res.redirect('/subscriber/transaction/income?error=true&type=sysError');
		  });
		}).catch(err => {
		  res.redirect('/subscriber/transaction/income?error=true&type=sysError');
		});
	  } else {
		createIncome();
	  }
	}
};

exports.updateIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		axios.get(`${process.env.API_URL}/subscribers/incomes/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const parentId = response.data.data.parentId || 0
			axios.get(`${process.env.API_URL}/subscribers/categories/income/update/${parentId}`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				axios.get(`${process.env.API_URL}/subscribers/salesperson/all`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseSalesperson => {
					const {success, type, error} = req.query
					if (success === 'true' && type === 'update') {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data, errorMessage: null , successMessage: "Updated Successfully!"});
					} 
					else if (error === 'true'){
						if (type === 'fileError') {
							res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: `Only image file (${photoSize} MB maximum) can be uploaded!` , successMessage: null});
						} else {
							res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
						}
					}						
					else {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
					}
				}).catch(err => {
					res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: response.data.data, category: responseCategory.data.data, salesperson: [],   errorMessage: "System Error!", successMessage: null });
				})
			}).catch(error => {
				res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: response.data.data, category: [],salesperson: [],   errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, trans: "income", transaction: {}, category: [], salesperson: [],  errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const cat = req.query.cat
		const categoryId = req.query.id
		const page = req.query.page || 1
		const { description, amount, incomeDate, catId, salespersonId, customer, itemName, price, quantity } = req.body;
		if (req.fileError) {
			res.redirect('/subscriber/transaction/income/update/' + id + `?error=true&type=fileError&trans=income&page=${page}` );
			return ;
		}
		const receipt = req.file ? req.file.filename : null
		let parameters = { description, incomeDate, catId }
		if (receipt) {
			parameters.receipt = receipt;
		}
		if (!amount) {
			const amount = parseInt(price) * parseInt(quantity)
			parameters.amount = `${amount}`
			parameters.itemName = itemName;
			parameters.price = price;
			parameters.quantity = quantity;
			parameters.salespersonId = salespersonId;
			parameters.customer = customer;
		} else {
			parameters.amount = amount
		}
		axios.put(`${process.env.API_URL}/subscribers/incomes/update/${id}`,parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			if (cat && categoryId){
				res.redirect('/subscriber/transaction/income/update/' + id + `?success=true&type=update&cat=income&id=${categoryId}&page=${page}`)
			} else {
				res.redirect('/subscriber/transaction/income/update/' + id + `?success=true&type=update&trans=income&page=${page}`)
			}
		}).catch(error => {
			res.redirect('/subscriber/transaction/income/update/' + id + `?error=true&type=sysError&trans=income&page=${page}` );
		})
	}
}

exports.updateIncomeTransCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		axios.get(`${process.env.API_URL}/subscribers/incomes/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const parentId = response.data.data.parentId || 0
			axios.get(`${process.env.API_URL}/subscribers/categories/income/update/${parentId}`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				axios.get(`${process.env.API_URL}/subscribers/salesperson/all`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseSalesperson => {
					const {success, type, error} = req.query
					if (success === 'true' && type === 'update') {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data, errorMessage: null , successMessage: "Updated Successfully!"});
					} 
					else if (error === 'true'){
						if (type === 'fileError') {
							res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: `Only image file (${photoSize} MB maximum) can be uploaded!` , successMessage: null});
						} else {
							res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
						}
					}						
					else {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
					}
				}).catch(err => {
					res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: response.data.data, category: responseCategory.data.data, salesperson: [],   errorMessage: "System Error!", successMessage: null });
				})
			}).catch(error => {
				res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: response.data.data, category: [],salesperson: [],   errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, trans: "income", transaction: {}, category: [], salesperson: [],  errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const cat = req.query.cat
		const categoryId = req.query.id
		const page = req.query.page || 1
		const { description, amount, incomeDate, catId, salespersonId, customer, itemName, price, quantity } = req.body;
		if (req.fileError) {
			res.redirect('/subscriber/category/transaction/income/update/' + id + `?error=true&type=fileError&id=${categoryId}&cat=income&page=${page}` );
			return ;
		}
		const receipt = req.file ? req.file.filename : null
		let parameters = { description, incomeDate, catId }
		if (receipt) {
			parameters.receipt = receipt;
		}
		if (!amount) {
			const amount = parseInt(price) * parseInt(quantity)
			parameters.amount = `${amount}`
			parameters.itemName = itemName;
			parameters.price = price;
			parameters.quantity = quantity;
			parameters.salespersonId = salespersonId;
			parameters.customer = customer;
		} else {
			parameters.amount = amount
		}
		axios.put(`${process.env.API_URL}/subscribers/incomes/update/${id}`,parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			if (cat && categoryId){
				res.redirect('/subscriber/category/transaction/income/update/' + id + `?success=true&type=update&cat=income&id=${categoryId}&page=${page}`)
			} else {
				res.redirect('/subscriber/category/transaction/income/update/' + id + `?success=true&type=update&cat=income&id=${categoryId}&page=${page}`)
			}
		}).catch(error => {
			res.redirect('/subscriber/category/transaction/income/update/' + id + `?error=true&type=sysError&cat=income&id=${categoryId}&page=${page}` );
		})
	}
}

exports.detailIncomeTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		axios.get(`${process.env.API_URL}/subscribers/incomes/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.render('subscriber/transaction-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName , transaction: response.data.data, trans: "income", errorMessage: null, successMessage: null });
		}).catch(error => {
			res.render('subscriber/transaction-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {}, organizationName: req.session.orgName, transaction: {}, errorMessage: "System Error!", trans: "income", successMessage: null });         
		})
	}
}