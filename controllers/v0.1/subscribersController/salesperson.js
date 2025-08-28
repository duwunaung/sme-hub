const axios = require('axios');
const e = require('express');
const { use, param } = require('../../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;
const exportCsvResponse = require('../../../utils/exportCsv');

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
			const {success, type, error} = req.query
			if (success === 'true') {
				if (type === 'delete') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Deleted!"});
				} else if (type === 'create') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Created!"});
				} else if (type === 'restore') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Restored!"});
				} else if (type === 'update') {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully Updated!"});
				} else {
					res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
				}
			} else if (error === 'true') {
				res.render('subscriber/salesperson', {baseCurrency: req.session.baseCurrency, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, salesperson: response.data.data ,  pagination: response.data.pagination, options: options, errorMessage: "Internal Server Error!" , successMessage: null});
			}
			else {
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