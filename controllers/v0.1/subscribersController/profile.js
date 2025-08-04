const axios = require('axios');
const bcrypt = require('bcryptjs');
require('dotenv').config()
const photoSize = process.env.RECEIPT_FILESIZE;
const appVersion = process.env.APP_VERSION;
const appCodeName = process.env.APP_CODENAME;

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
					res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: "Successfully Updated!", errorMessage: null }); 
				}
			} else if (error === 'true') {
				if (type === 'invalidPassword') {
					res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: "Invalid Password!" });
				} else if (type === 'sysError') {
					res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: "System Error!" });
				} else if (type === 'dupEmail') {
					res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: "Email Already Existed!" });
				}
			} else {
				res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName,  user: response.data.data, successMessage: null, errorMessage: null }); 
			}
		}).catch(error => {
			res.render('subscriber/user-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName,  user: {}, successMessage: null, errorMessage: null });         
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
				if (error.status === 500 && error.response.data.message === 'duplicate email') {
					res.redirect('/subscriber/user/profile?error=true&type=dupEmail');
				} else {
					res.redirect('/subscriber/user/profile?error=true&type=sysError');
				}
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
					res.render('subscriber/organization-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: "Successfully Updated!", errorMessage: null , linkExtend: process.env.LICENSE_EXTEND_URL}); 
				}
			} else if (error === 'true') {
				if (type === 'fileError') {
					res.render('subscriber/organization-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: null, errorMessage: `Only image file (${photoSize} MB maximum) can be uploaded!` , linkExtend: process.env.LICENSE_EXTEND_URL}); 
				}
				else {
					res.render('subscriber/organization-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: null, errorMessage: null , linkExtend: process.env.LICENSE_EXTEND_URL}); 
				}
			}
			else {
				res.render('subscriber/organization-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo, organizationName: req.session.orgName, options: options, org: response.data.data, successMessage: null, errorMessage: null , linkExtend: process.env.LICENSE_EXTEND_URL}); 
			}
		}).catch(error => {
			res.render('subscriber/organization-profile', {appVersion: appVersion, appCodeName: appCodeName, userName: req.session.user, userRole: req.session.role, logo: req.session.orgLogo,  organizationName: req.session.orgName, options: options, org: {}, successMessage: null, errorMessage: null , linkExtend: process.env.LICENSE_EXTEND_URL});         
		})
	} else {
		const {name, address, phone, baseCurrency, country } = req.body
		const logo = req.file ? req.file.filename : null
		if (req.fileError) {
			res.redirect('/subscriber/organization/profile' + `?error=true&type=fileError`);
			return ;
		}
		let parameters = { name, address, phone, baseCurrency, country}
		if (logo) {
			parameters.logo = logo;
		}

		axios.put(`${process.env.API_URL}/subscribers/organization/profile/update`, parameters, {
			headers: {
				'Authorization': `${req.session.token}`
			}
		}).then(response => {
			req.session.orgName = response.data.data.name
			if (logo)
				req.session.orgLogo = response.data.data.logo
			req.session.baseCurrency = response.data.data.baseCurrency
			res.redirect('/subscriber/organization/profile'  + `?success=true&type=update`)
		}).catch(error => {
			res.redirect('/subscriber/organization/profile' + `?error=true&type=sysError`);
		})
	}
}