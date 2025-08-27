const axios = require('axios');
const e = require('express');
const { use, param } = require('../../../routes/v0.1/utilsRoute');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;
const exportCsvResponse = require('../../../utils/exportCsv');

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