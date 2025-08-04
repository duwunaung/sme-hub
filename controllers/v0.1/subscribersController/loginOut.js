const axios = require('axios');
require('dotenv').config()

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
						res.render('subscriber/login', { errorMessage: response.data.message , registerLink: process.env.USER_REGISTER_LINK});
					}
				})
				.catch(error => {
					res.render('subscriber/login', { errorMessage: error.response.data.message , registerLink: process.env.USER_REGISTER_LINK});
				})
		} catch (error) {
			res.render('subscriber/login', { errorMessage: 'An error occurred during login.' , registerLink: process.env.USER_REGISTER_LINK});
		}
	} else {
		res.render('subscriber/login', { errorMessage: null , registerLink: process.env.USER_REGISTER_LINK})
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