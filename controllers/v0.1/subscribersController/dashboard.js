const axios = require('axios');
require('dotenv').config()

exports.dashboardSubscriber = (req, res) => {
	if (req.method == 'GET') {
		const { num, type } = req.query;
		let dashboardUrl = `${process.env.API_URL}/subscribers/dashboard`;
		let barchartUrl = `${process.env.API_URL}/subscribers/dashboard/barchart`;
		let overviewDataUrl = `${process.env.API_URL}/subscribers/dashboard/overview`;
		const queryParams = [];
		if (num) queryParams.push(`num=${num}`);
		if (type) queryParams.push(`type=${type}`);

		if (queryParams.length > 0) {
			dashboardUrl += `?${queryParams.join('&')}`;
		}
		axios.get(dashboardUrl, { headers: { 'Authorization': `${req.session.token}` } })
		.then(dashboardRes => {
			axios.get(barchartUrl, { headers: { 'Authorization': `${req.session.token}` } })
			.then(barcharRes => {
				axios.get(overviewDataUrl, { headers: { 'Authorization': `${req.session.token}`}})
				.then(overviewRes => {
					res.render('subscriber/home', { overviewData: overviewRes.data.data, barchart: barcharRes.data.data, data: dashboardRes.data.data, baseCurrency: req.session.baseCurrency, token: req.session.token, userName: req.session.user, userRole: req.session.role, organizationName: req.session.orgName, logo: req.session.orgLogo , successMessage:null, errorMessage:null})
				}).catch(error => {
					res.render('subscriber/home', { overviewData: {} , barchart: barcharRes.data.data, data: dashboardRes.data.data, baseCurrency: req.session.baseCurrency, token: req.session.token, userName: req.session.user, userRole: req.session.role, organizationName: req.session.orgName, logo: req.session.orgLogo , successMessage:null, errorMessage:null})
				})
			})
			.catch(err => {
				res.render('subscriber/home', {overviewData: {} ,barchart: {}, data: dashboardRes.data.data, baseCurrency: req.session.baseCurrency, token: req.session.token, userName: req.session.user, userRole: req.session.role, organizationName: req.session.orgName, logo: req.session.orgLogo, successMessage:null, errorMessage:null })
			})
		})
		.catch(error => {
			res.render('subscriber/home', {overviewData: {} ,barchart: {}, data: {}, baseCurrency: req.session.baseCurrency, token: req.session.token, userName: req.session.user, userRole: req.session.role, organizationName: req.session.orgName, logo: req.session.orgLogo, errorMessage: "Internal Server Error", successMessage: null })
		});
	}
}