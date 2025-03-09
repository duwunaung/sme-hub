const axios = require('axios');
const e = require('express');
const { use, param } = require('../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');

exports.login = (req, res) => {
	if (req.method === 'POST') {
		const { email, password } = req.body;
		try {
			axios.post(`${process.env.API_URL}/subscribers/login`, { email, password })
				.then(response => {
					if (response.data.success) {
						req.session.token = response.data.data.token;
						req.session.user = response.data.data.user.name;
						req.session.role = response.data.data.user.role;
						req.session.orgName = response.data.data.user.orgName;
						req.session.orgLogo = response.data.data.user.orgLogo;
						req.session.baseCurrency = response.data.data.user.baseCurrency;
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

exports.editUsrProfile = (req, res) => {
	if (req.method == 'GET') {
		axios.get(`${process.env.API_URL}/subscribers/user/profile`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const {success, error, type} = req.query
			if (success === 'true') {
				if (type === 'update') {
					res.render('subscriber/user-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: "Successfully Updated!", errorMessage: null }); 
				}
			} else if (error === 'true') {
				if (type === 'invalidPassword') {
					res.render('subscriber/user-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: "Invalid Password!" });
				} else if (type === 'sysError') {
					res.render('subscriber/user-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: "System Error!" });
				}
			} else {
				res.render('subscriber/user-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: null }); 
			}
		}).catch(error => {
			res.render('subscriber/user-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName,  user: {}, successMessage: null, errorMessage: null });         
		})
	} else {
		const {name, email, phone } = req.body
		const {currentPassword, newPassword, confirmPassword } = req.body
		let parameters = { name, email, phone }

        const updateProfile = async () => {
            try {
                if (currentPassword) {
                    const resPass = await axios.get(`${process.env.API_URL}/subscribers/user/profile/check`, {
                        headers: {
                            'Authorization': `${req.session.token}`
                        }
                    });
                    
                    const hashedPassword = resPass.data.data.password;
                    const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
                    
                    if (!isPasswordValid) {
                        return res.redirect('/subscriber/user/profile?error=true&type=invalidPassword');
                    }
                    if (newPassword && newPassword === confirmPassword) {
                        parameters.password = await bcrypt.hash(newPassword, 10);
                    }
                }
                const response = await axios.put(
                    `${process.env.API_URL}/subscribers/user/profile/update`, 
                    parameters, 
                    {
                        headers: {
                            'Authorization': `${req.session.token}`
                        }
                    }
                );
				req.session.user = response.data.data.name
                res.redirect('/subscriber/user/profile?success=true&type=update');
            } catch (error) {
                res.redirect('/subscriber/user/profile?error=true&type=sysError');
            }
        };
        updateProfile();
	}
}

exports.editOrgProfile = (req, res) => {
	if (req.method == 'GET') {
		const options = [
			{ id: 1, name: 'MMK' },
			{ id: 2, name: 'USD' },
			{ id: 3, name: 'THB' }
		];
		axios.get(`${process.env.API_URL}/subscribers/organization/profile`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const {success, error, type} = req.query
			if (success === 'true') {
				if (type === 'update') {
					res.render('subscriber/organization-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: "Successfully Updated!", errorMessage: null }); 
				}
			} else {
				res.render('subscriber/organization-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: null, errorMessage: null }); 
			}
		}).catch(error => {
			res.render('subscriber/organization-profile', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, options: options, org: {}, successMessage: null, errorMessage: null });         
		})
	} else {
		const {name, address, phone, baseCurrency } = req.body
		const logo = req.file ? req.file.filename : null
		let parameters = { name, address, phone, baseCurrency}
		if (logo) {
			parameters.logo = logo;
		}

		axios.put(`${process.env.API_URL}/subscribers/organization/profile/update`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			req.session.orgName = response.data.data.name
			req.session.orgLogo = response.data.data.logo
			req.session.baseCurrency = response.data.data.baseCurrency
			res.redirect('/subscriber/organization/profile'  + `?success=true&type=update`)
		}).catch(error => {
			res.redirect('/subscriber/organization/profile' + `?error=true&type=sysError`);
		})
	}
}

exports.listAllTransactions = (req, res) => {
    if (req.method == 'GET') {
        const { num, type, search, catId } = req.query;
		const page = req.query.page || 1;
		const pageSize = req.query.pageSize || 10;
        let transactionsUrl = `${process.env.API_URL}/subscribers/transactions`;

        const queryParams = [];
		if (page) queryParams.push(`page=${page}`)
		if (pageSize) queryParams.push(`pageSize=${pageSize}`)
        if (num) queryParams.push(`num=${num}`);
        if (type) queryParams.push(`type=${type}`);
        if (search) queryParams.push(`search=${search}`);
        if (catId) queryParams.push(`catId=${catId}`);

        if (queryParams.length > 0) {
            transactionsUrl += `?${queryParams.join('&')}`;
        }
        axios.get(transactionsUrl, { headers: { 'Authorization': `${req.session.token}` } })
        .then(transactionsRes => {
            res.render('subscriber/transaction', {userName: req.session.user, userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
                trans: "all",
                category: [],
				salesperson: [],
                transaction: transactionsRes.data.data,
                pagination: transactionsRes.data.pagination,
                errorMessage: null,
                successMessage: null
            });
        })
        .catch(error => {
            res.render('subscriber/transaction', {userName: req.session.user, userRole: req.session.role,
				baseCurrency: req.session.baseCurrency, 
				logo: req.session.orgLogo,
                organizationName: req.session.orgName,
                trans: "all",
                category: [],
				salesperson: [],
                transaction: [],
                pagination: {},
                errorMessage: "System Error!",
                successMessage: null
            });
        });
    }
};

exports.listExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const { search , num, type} = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		let url_api = `${process.env.API_URL}/subscribers/categories/expense/list`
		const queryParams = [];
		if (page) {
			queryParams.push(`page=${page}`);
		}
		if (pageSize) {
			queryParams.push(`pageSize=${pageSize}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
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
			const {success, type} = req.query
			if (success === 'true') {
				if (type === 'delete') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Deleted!"});
				} else if (type === 'create') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Created!"});
				} else if (type === 'restore') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Restored!"});
				} else {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
				}
			} else {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "expense", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
			}
			
		}).catch(error => {
			if (error.status === 404) {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], options: [] , cat: "expense", pagination: {}, errorMessage: null, successMessage: null });
			} else {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], options: [] , cat: "expense", pagination: {}, errorMessage: "System Error!", successMessage: null });
			}
		})
	}
}

exports.createExpenseCat = (req, res) => {
	if (req.method == 'POST') {

		const { name ,categoryType, parentCategory } = req.body;
		const parameters = {name}
		let parentId;
		if (categoryType === 'underParent' && parentCategory == 'purchase') {
			parentId = 2;
			parameters.parentId = parentId; 
		}
		axios.post(`${process.env.API_URL}/subscribers/categories/expense/create`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/category/expense?success=true&type=create'  )
		}).catch(error => {
			if (error.status === 501 && error.response.data.message === "duplicate_name") {
				axios.get(`${process.env.API_URL}/subscribers/categories/expense/category/${name}`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseCategory => {
					const status = responseCategory.data.data.status
					const id = responseCategory.data.data.id
					res.redirect(`/subscriber/category/expense?error=true&type=duplicate-name&status=${status}&id=${id}&name=${name}`)
				}).catch(error => {
					res.redirect('/subscriber/category/expense?error=true&type=create')
				})
			} else {
				res.redirect('/subscriber/category/expense?error=true&type=create')
			}
		})
	}
}

exports.restoreExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.put(`${process.env.API_URL}/subscribers/categories/expense/restore/${id}`, {},  {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/expense'+ '?success=true&type=restore')
		}).catch(error => {
			res.redirect('/subscriber/category/expense' + '?error=true&type=sysError')
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
			res.redirect('/subscriber/category/expense' + '?success=true&type=delete')
		}).catch(error => {
			res.redirect('/subscriber/category/expense' + '?error=true&type=sysError')
		})
	}
}

exports.updateExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		const options = [
			{ id: 1, name: 'active' },
			{ id: 2, name: 'deleted' }
		];
		axios.get(`${process.env.API_URL}/subscribers/categories/expense/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const {success, type} = req.query
			if (success === 'true' && type === 'update') {
				res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: response.data.data, options: options, errorMessage: null, successMessage: "Updated Successfully!", cat: 'expense' });
			} else {
				res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: response.data.data, options: options, errorMessage: null, successMessage: null, cat: 'expense' });
			}
		}).catch(error => {
			res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: {}, options: options, errorMessage: "System Error!", successMessage: null, cat: 'expense' });
		})
	} else {
		const id = req.params.id
		const { name, parent } = req.body;
		const parameters = { name }
		let parentId;
		if (parent && parent === 'purchase'){
			parentId = 2;
			parameters.parentId = parentId;
		}
		const page = req.query.page || 1
		axios.put(`${process.env.API_URL}/subscribers/categories/expense/${id}`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/expense/update/' + id + `?success=true&type=update&cat=expense&page=${page}`)
		}).catch(error => {
			res.redirect('/subscriber/category/expense/update/' + id + `?error=true&type=sysError&cat=expense&page=${page}`);
		})
	}
}

exports.detailExpenseCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const {num, type, search } = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		axios.get(`${process.env.API_URL}/subscribers/categories/expense/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(responseCategory => {
			let url_api = `${process.env.API_URL}/subscribers/categories/expense/detail/${id}`
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
			if (queryParams.length > 0) {
				url_api += `?${queryParams.join('&')}`;
			}
			axios.get(url_api, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(response => {
				res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: responseCategory.data.data, transaction: response.data.data,pagination:response.data.pagination, cat: "expense", errorMessage: null, successMessage: null });
			}).catch(error => {
				if (error.status == 404)
				{
					res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, transaction: [], category: responseCategory.data.data,pagination: {}, errorMessage: null, cat: "expense", successMessage: null });
				} else {
					res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role,  logo: req.session.orgLogo, organizationName: req.session.orgName, transaction: [], category: responseCategory.data.data,pagination: {}, errorMessage: "System Error!", cat: "expense", successMessage: null }); 
				}        
			})
		}).catch(error => {
			res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, transaction: [],pagination: {}, category: {name: "Error"}, errorMessage: "System Error!", cat: "expense", successMessage: null });         
		})
	}
}

exports.listIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const { search, num, type } = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		let url_api = `${process.env.API_URL}/subscribers/categories/income/list`
		const queryParams = [];
		if (page) {
			queryParams.push(`page=${page}`);
		}
		if (pageSize) {
			queryParams.push(`pageSize=${pageSize}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (num) {
			queryParams.push(`num=${num}`);
		}
		if (type) {
			queryParams.push(`type=${type}`);
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
			const {success, type} = req.query
			if (success === 'true') {
				if (type === 'delete') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Deleted!"});
				} else if (type === 'create') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Created!"});
				} else if (type === 'restore') {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Restored!"});
				} else {
					res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
				}
			} else {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: response.data.data , cat: "income", pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
			}
			
		}).catch(error => {
			if (error.status === 404) {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], options: [] , cat: "income", pagination: {}, errorMessage: null, successMessage: null });
			} else {
				res.render('subscriber/categories', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: [], options: [] , cat: "income", pagination: {}, errorMessage: "System Error!", successMessage: null });
			}
		})
	}
}

exports.createIncomeCat = (req, res) => {
	if (req.method == 'POST') {

		const { name, categoryType, parentCategory } = req.body;
		const parameters = {name}
		let parentId;
		if (categoryType === 'underParent' && parentCategory == 'sale') {
			parentId = 1;
			parameters.parentId = parentId; 
		}
		axios.post(`${process.env.API_URL}/subscribers/categories/income/create`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/category/income?success=true&type=create'  )
		}).catch(error => {
			if (error.status === 501 && error.response.data.message === "duplicate_name") {
				axios.get(`${process.env.API_URL}/subscribers/categories/income/category/${name}`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseCategory => {
					const status = responseCategory.data.data.status
					const id = responseCategory.data.data.id
					res.redirect(`/subscriber/category/income?error=true&type=duplicate-name&status=${status}&id=${id}&name=${name}`)
				}).catch(error => {
					res.redirect('/subscriber/category/income?error=true&type=create')
				})
			} else {
				res.redirect('/subscriber/category/income?error=true&type=create')
			}
		})
	}
}

exports.restoreIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.put(`${process.env.API_URL}/subscribers/categories/income/restore/${id}`, {},  {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/income'+ '?success=true&type=restore')
		}).catch(error => {
			res.redirect('/subscriber/category/income' + '?error=true&type=sysError')
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
			res.redirect('/subscriber/category/income'+ '?success=true&type=delete')
		}).catch(error => {
			res.redirect('/subscriber/category/income' + '?error=true&type=sysError')
		})
	}
}

exports.updateIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		const options = [
			{ id: 1, name: 'active' },
			{ id: 2, name: 'deleted' }
		];
		axios.get(`${process.env.API_URL}/subscribers/categories/income/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const {success, type} = req.query
			if (success === 'true' && type === 'update') {
				res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: response.data.data, options: options, errorMessage: null, successMessage: "Updated Successfully!", cat: 'income' });
			} else {
				res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: response.data.data, options: options, errorMessage: null, successMessage: null , cat: 'income' });
			}
		}).catch(error => {
			res.render('subscriber/categories-edit', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName, category: {}, options: options, errorMessage: "System Error!", successMessage: null, cat: 'income'  });
		})
	} else {
		const id = req.params.id
		const { name , parent } = req.body;
		const parameters = { name }
		let parentId;
		if (parent && parent === 'sale'){
			parentId = 1;
			parameters.parentId = parentId;
		}
		const page = req.query.page || 1
		axios.put(`${process.env.API_URL}/subscribers/categories/income/${id}`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/category/income/update/' + id + `?success=true&type=update&cat=income&page=${page}`)
		}).catch(error => {
			res.redirect('/subscriber/category/income/update/' + id + `?error=true&type=sysError&cat=income&page=${page}`);
		})
	}
}

exports.detailIncomeCat = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const {num, type, search } = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		axios.get(`${process.env.API_URL}/subscribers/categories/income/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(responseCategory => {
			let url_api = `${process.env.API_URL}/subscribers/categories/income/detail/${id}`
			const queryParams = [];
			if (page) {
				queryParams.push(`page=${page}`)
			}
			if (pageSize) {
				queryParams.push(`pageSize=${pageSize}`)
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
			if (queryParams.length > 0) {
				url_api += `?${queryParams.join('&')}`;
			}
			axios.get(url_api, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(response => {
				res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, category: responseCategory.data.data,pagination: response.data.pagination, transaction: response.data.data, cat: "income", errorMessage: null, successMessage: null });
			}).catch(error => {
				if (error.status == 404)
				{
					res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, transaction: [],pagination: {}, category: responseCategory.data.data, errorMessage: null, cat: "income", successMessage: null });
				} else {
					res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, transaction: [],pagination: {}, category: responseCategory.data.data, errorMessage: "System Error!", cat: "income", successMessage: null }); 
				}        
			})
		}).catch(error => {
			res.render('subscriber/categories-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, transaction: [],pagination: {}, category: {name: "Error"}, errorMessage: "System Error!", cat: "income", successMessage: null });         
		})
	}
}

exports.listExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const {num, type, search, catId } = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		let url_api = `${process.env.API_URL}/subscribers/expenses`
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
			axios.get(`${process.env.API_URL}/subscribers/categories/expense`, {
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
					if (success === 'true'){
						if (type === 'create') {
							res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data,salesperson: responseSalesperson.data.data , transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: "Successfully Created!"});
						}
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data,salesperson: responseSalesperson.data.data , transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
					}
				}).catch(err => {
					res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "expense", category: [], transaction: [], salesperson: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
				})
			}).catch(error => {
				res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "expense", category: [], transaction: [],salesperson: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			axios.get(`${process.env.API_URL}/subscribers/categories/expense`, {
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
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data, transaction: [], salesperson: responseSalesperson.data.data, pagination: {}, errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data, transaction: [], salesperson: responseSalesperson.data.data, pagination: {}, errorMessage: "System Error!", successMessage: null });
					}
				}).catch(err => {
					if (err.status === 404) {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role,  logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data, transaction: [],  pagination: {},salesperson: [], errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role,  logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: responseCategory.data.data, transaction: [],  pagination: {},salesperson: [], errorMessage: "System Error!", successMessage: null });
					}
				})
			}).catch(error => {
				if (error.status === 404) {
					res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role,  logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: [], transaction: [],  pagination: {},salesperson: [], errorMessage: null, successMessage: null });
				} else {
					res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role,  logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "expense", category: [], transaction: [],  pagination: {},salesperson: [], errorMessage: "System Error!", successMessage: null });
				}
			})
		})
	}
}

exports.createExpenseTrans = (req, res) => {
	if (req.method == 'POST') {
		
		const { description, amount, expenseDate, catId, itemName, price, quantity, vendorName } = req.body;
		const receipt = req.file ? req.file.filename : null
		let parameters = { expenseDate, catId }
		if (description) {
			parameters.description = description;
			parameters.amount = amount;
		} else {
			parameters.itemName = itemName;
			parameters.price = price;
			parameters.quantity = quantity;
			parameters.vendorName = vendorName;
			const amount = parseInt(price) * parseInt(quantity);
			parameters.amount = `${amount}`;
			const description = `Purchased ${quantity} ${itemName} from ${vendorName}`
			parameters.description = description
		}
		if (receipt) {
			parameters.receipt = receipt;
		}
		axios.post(`${process.env.API_URL}/subscribers/expenses/create`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/transaction/expense?success=true&type=create')
		}).catch(error => {
			res.redirect('/subscriber/transaction/expense?error=true&type=create')
		})
	}
}

exports.updateExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		axios.get(`${process.env.API_URL}/subscribers/expenses/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			const parentId = response.data.data.parentId || 0
			axios.get(`${process.env.API_URL}/subscribers/categories/expense/update/${parentId}`, {
				headers: {
					'Authorization': `${req.session.token}`
				}
			}).then(responseCategory => {
				const {success, type} = req.query
				if (success === 'true' && type === 'update') {
					res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, salesperson: [], organizationName: req.session.orgName,trans: "expense", transaction: response.data.data, category: responseCategory.data.data, errorMessage: null , successMessage: "Updated Successfully!"});
				} else {
					res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},salesperson: [],organizationName: req.session.orgName,trans: "expense", transaction: response.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
				}
			}).catch(error => {
				res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, salesperson: [],organizationName: req.session.orgName,trans: "expense",  transaction: {}, category: [],  errorMessage: "System Error!", successMessage: null });
			})
		}).catch(error => {
			res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},salesperson: [],organizationName: req.session.orgName, trans: "expense", transaction: {}, category: [],  errorMessage: "System Error!", successMessage: null });
			
		})
	} else {
		const id = req.params.id
		const cat = req.query.cat
		const categoryId = req.query.id
		const page = req.query.page || 1
		const { description, amount, expenseDate, catId , vendorName, itemName, price, quantity} = req.body;
		const receipt = req.file ? req.file.filename : null
		let parameters = { description, expenseDate, catId }
		if (receipt) {
			parameters.receipt = receipt;
		}
		if (!amount) {
			const amount = parseInt(price) * parseInt(quantity)
			parameters.amount = `${amount}`
			parameters.itemName = itemName;
			parameters.price = price;
			parameters.quantity = quantity;
			parameters.vendorName = vendorName;
		} else {
			parameters.amount = amount
		}
		axios.put(`${process.env.API_URL}/subscribers/expenses/update/${id}`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			if (cat && categoryId){
				res.redirect('/subscriber/transaction/expense/update/' + id + `?success=true&type=update&cat=expense&id=${categoryId}&page=${page}`)
			} else {
				res.redirect('/subscriber/transaction/expense/update/' + id + `?success=true&type=update&trans=expense&page=${page}`)
			}
		}).catch(error => {
			res.redirect('/subscriber/transaction/expense/update/' + id + `?error=true&type=sysError&trans=expense&page=${page}` );
		})
	}
}

exports.detailExpenseTrans = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		const page = req.query.page || 1
		axios.get(`${process.env.API_URL}/subscribers/expenses/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.render('subscriber/transaction-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,transaction: response.data.data, trans: "expense", errorMessage: null, successMessage: null });
		}).catch(error => {
			res.render('subscriber/transaction-detail', {userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {},organizationName: req.session.orgName, transaction: {}, errorMessage: "System Error!", trans: "expense", successMessage: null });         
		})
	}
}

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
					if (success === 'true') {
						if (type === 'create') {
							res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, salesperson: responseSalesperson.data.data ,transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: "Successfully Created!"});
						}
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data,salesperson: responseSalesperson.data.data , transaction: response.data.data, pagination: response.data.pagination, errorMessage: null , successMessage: null});
					}
				}).catch(err => {
					if (err.status === 404) {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], pagination: {},salesperson: [] , errorMessage: null, successMessage: null });
					} else {
						res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: responseCategory.data.data, transaction: [], pagination: {},salesperson: [] , errorMessage: "System Error!", successMessage: null });
					}
				})
			}).catch(error => {
				res.render('subscriber/transaction', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, trans: "income", category: [], transaction: [], pagination: {}, salesperson: [] ,errorMessage: "System Error!", successMessage: null });
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
		  const description = finalSalespersonName + " has sold " + quantity + " " + itemName + " to " + customer;
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
					const {success, type} = req.query
					if (success === 'true' && type === 'update') {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data, errorMessage: null , successMessage: "Updated Successfully!"});
					} else {
						res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page},organizationName: req.session.orgName,trans: "income", transaction: response.data.data, salesperson: responseSalesperson.data.data, category: responseCategory.data.data,  errorMessage: null , successMessage: null});
					}
				}).catch(err => {
					res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: {}, category: [], salesperson: [],   errorMessage: "System Error!", successMessage: null });
				})
			}).catch(error => {
				res.render('subscriber/transaction-edit', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, pagination: {page: page}, organizationName: req.session.orgName,trans: "income",  transaction: {}, category: [],salesperson: [],   errorMessage: "System Error!", successMessage: null });
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

exports.createSalesperson = (req, res) => {
	if (req.method == 'POST') {

		const { name } = req.body;
		const parameters = {name}
		axios.post(`${process.env.API_URL}/subscribers/salesperson/create`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
				res.redirect('/subscriber/salesperson?success=true&type=create'  )
		}).catch(error => {
			if (error.status === 501 && error.response.data.message === "duplicate_name") {
				axios.get(`${process.env.API_URL}/subscribers/salesperson/list/${name}`, {
					headers: {
						'Authorization': `${req.session.token}`
					}
				}).then(responseSalesperson => {
					const status = responseSalesperson.data.data.status
					const id = responseSalesperson.data.data.id
					res.redirect(`/subscriber/salesperson?error=true&type=duplicate-name&status=${status}&id=${id}&name=${name}`)
				}).catch(err => {
					res.redirect('/subscriber/salesperson?error=true&type=create')
				})
			} else {
				res.redirect('/subscriber/salesperson?error=true&type=create')
			}
		})
	}
}

exports.listSalesperson = (req, res) => {
	if (req.method == 'GET') {
		const { search , num, type} = req.query
		const page = req.query.page || 1
		const pageSize = req.query.pageSize || 10
		let url_api = `${process.env.API_URL}/subscribers/salesperson/list`
		const queryParams = [];
		if (page) {
			queryParams.push(`page=${page}`);
		}
		if (pageSize) {
			queryParams.push(`pageSize=${pageSize}`);
		}
		if (search) {
			queryParams.push(`search=${search}`);
		}
		if (num) {
			queryParams.push(`num=${num}`)
		}
		if (type) {
			queryParams.push(`type=${type}`)
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
			const {success, type} = req.query
			if (success === 'true') {
				if (type === 'delete') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Deleted!"});
				} else if (type === 'create') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Created!"});
				} else if (type === 'restore') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Restored!"});
				} else {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
				}
			} else {
				res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
			}
			
		}).catch(error => {
			if (error.status === 404) {
				res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: [], options: [] ,  pagination: {}, errorMessage: null, successMessage: null });
			} else {
				res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: [], options: [] ,  pagination: {}, errorMessage: "System Error!", successMessage: null });
			}
		})
	}
}

exports.updateSalesperson = (req, res) => {
	if (req.method === 'POST' ) {
		const id = req.params.id
		const { name } = req.body;
		const page = req.query.page || 1
		axios.put(`${process.env.API_URL}/subscribers/salesperson/update/${id}`, { name }, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/salesperson' + `?success=true&type=update&page=${page}`)
		}).catch(error => {
			res.redirect('/subscriber/salesperson' + `?error=true&type=sysError&page=${page}`);
		})
	}
}

exports.restoreSalesperson = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id
		axios.put(`${process.env.API_URL}/subscribers/salesperson/restore/${id}`, {},  {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/salesperson'+ '?success=true&type=restore')
		}).catch(error => {
			res.redirect('/subscriber/salesperson' + '?error=true&type=sysError')
		})
	}
}

exports.deleteSalesperson = (req, res) => {
	if (req.method == 'GET') {
		const id = req.params.id

		axios.delete(`${process.env.API_URL}/subscribers/salesperson/delete/${id}`, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			res.redirect('/subscriber/salesperson'+ '?success=true&type=delete')
		}).catch(error => {
			res.redirect('/subscriber/salesperson' + '?error=true&type=sysError')
		})
	}
}