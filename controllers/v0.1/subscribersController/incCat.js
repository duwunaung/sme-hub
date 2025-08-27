const axios = require('axios');
const e = require('express');
const { use, param } = require('../../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;
const exportCsvResponse = require('../../../utils/exportCsv');

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
		} else {
			parameters.parentId = 0
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
		const { name , categoryType, status } = req.body;
		const parameters = { name, status }
		if (categoryType === 'underParent'){
			parameters.parentId = 1;
		} else {
			parameters.paraentId = 0;
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