const axios = require('axios');

exports.login = (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;
        try {
            axios.post(`${process.env.API_URL}/utils/login`, { email, password })
                .then(response => {
                    if (response.data.success) {
                        req.session.token = response.data.data.token;
                        req.session.user = response.data.data.name;
                        res.redirect('/superadmin/dashboard');
                    } else {
                        res.render('superadmin/login', { errorMessage: response.data.message });
                    }
                })
                .catch(error => {
                    res.render('superadmin/login', { errorMessage: error.response.data.message });
                })
        } catch (error) {
            res.render('superadmin/login', { errorMessage: 'An error occurred during login.' });
        }
    } else {
        res.render('superadmin/login', { errorMessage: null })
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

exports.orgs = (req, res) => {
    if (req.method == 'GET') {
        const page = req.query.page || 1
        axios.get(`${process.env.API_URL}/organizations?page=${page}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const error = req.query.error;
            const type = req.query.type;
			const success = req.query.success;
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' }
            ];
            if (error) {
                if (type == 'register') {
                    res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: "Cannot register at the moment!" , successMessage: null});
                } else if (type == '404Error') {
                    res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: "404 Organization Not Found!" , successMessage: null});
                } else if (type == 'sysError') {
                    res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: "Internal Server Error!" , successMessage: null});
                }
            } else if (success) {
				if (type === 'register') {
					res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully created!"});
				} else if (type === 'org-delete') {
					res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully deleted!"});
				} else if (type === 'org-restore') {
					res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: null , successMessage: "Successfully restored!"});
				}
            }
			else {
                res.render('superadmin/organizations', { orgs: response.data.data, pagination: response.data.pagination, options: options, errorMessage: null , successMessage: null});
            }
        }).catch(error => {
            res.render('superadmin/organizations', { orgs: [], options: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
        })
    }
}

exports.restoreOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const page = req.query.page

        axios.get(`${process.env.API_URL}/organizations/restore/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=org-restore&page=' + page)
        }).catch(error => {
            if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&page=' + page)
			}
			else {
				res.redirect('/superadmin/organizations?error=true&type=sysError&page=' + page)
			}
        })
    }
}

exports.deleteOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const page = req.query.page

        axios.delete(`${process.env.API_URL}/organizations/delete/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=org-delete&page=' + page)
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&page=' + page)
			}
			else {
				res.redirect('/superadmin/organizations?error=true&type=sysError&page=' + page)
			}
            
        })
    }
}

exports.updateOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const page = req.query.page
        axios.get(`${process.env.API_URL}/organizations/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' }
            ];
            const success = req.query.success;
            const type = req.query.type;
			const error = req.query.error;
            if (success) {
                if (type == 'update') {
                    res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: null, successMessage: "Successfully Updated!" });
                } else if (type == 'extendLicense') {
                    res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: null, successMessage: "Successfully Extended!" });
                } else if (type == 'reduceLicense') {
                    res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: null, successMessage: "Successfully Reduced!" });
                }
            } else if (error) {
				if (type == 'sysError') {
					res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: "Internal Server Error!", successMessage: null });
				} else if (type == '406Error') {
					res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: "Cannot Accept Your Request!", successMessage: null });
				}
			}
			else {
                res.render('superadmin/edit-organization', { org: response.data.data, page: page, options: options, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&page=' + page);
			} else {
				res.render('superadmin/edit-organization', { org: {}, page: page, errorMessage: "System Error!", successMessage: null });
			}
            
        })
    } else {
        const orgId = req.params.id
        const page = req.query.page
        const { name, address, phone, status } = req.body;
        axios.put(`${process.env.API_URL}/organizations/update/${orgId}`, { name, address, phone, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=update&page=' + page)
        }).catch(error => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=sysError&page=' + page);
        })
    }

}

exports.extendLicense = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const num = req.query.num
        const type = req.query.type
        const page = req.query.page || 1

        axios.put(`${process.env.API_URL}/organizations/license/${orgId}`, { num, type }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
			if (num < 0)
			{
				res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=reduceLicense&page=' + page)
			} else {
				res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=extendLicense&page=' + page)
			}
        }).catch(error => {
			if (error.status == 406){
				res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=406Error&page=' + page)
			} else {
				res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=sysError&page=' + page)
			}
        })
    }
}

exports.registerOrg = (req, res) => {
    if (req.method == 'POST') {
        const page = req.query.page
        const successPage = req.query.successPage

        const { name, address, phone, status } = req.body;
        axios.post(`${process.env.API_URL}/organizations/create`, { name, address, phone, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=register&page=' + successPage )
        }).catch(error => {
            res.redirect('/superadmin/organizations?error=true&type=register&page=' + page )
        })
    }
}

exports.detailOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const error = req.query.error
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage

        const options = [
            { id: 1, name: 'active' },
            { id: 2, name: 'deleted' }
        ];
        const roles = [
            {
                id: 1,
                name: 'admin'
            },
            {
                id: 2,
                name: 'manager'
            },
            {
                id: 3,
                name: 'staff'
            }
        ]
        axios.get(`${process.env.API_URL}/organizations/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            axios.get(`${process.env.API_URL}/organizations/users/${orgId}?page=${userPage}`, {
                headers: {
                    'Authorization': `${req.session.token}`
                }
            }).then( users => {
                if (error) {
                    if (req.query.type == 'user-create') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "Cannot create user at the moment!", successMessage: null });
                    } else if (req.query.type == 'user-delete') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "Cannot delete user at the moment!", successMessage: null });
                    } else if (req.query.type == 'user-restore') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "Cannot restore user at the moment!", successMessage: null });
                    } else if (req.query.type == 'dup-email') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "Duplicate Email!", successMessage: null });
                    } else if (req.query.type == '404Error') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "404 User Not Found!", successMessage: null });
                    } else {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: "Internal Server Error!", successMessage: null });
                    }
                } else {
                    if (req.query.type == 'user-create') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: null, successMessage: "User Created" });
                    } else if (req.query.type == 'user-delete') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: null, successMessage: "User Deleted" });
                    } else if (req.query.type == 'user-restore') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: null, successMessage: "User Restored" });
                    } else {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, orgPage: orgPage, pagination: users.data.pagination, options: options, roles: roles, errorMessage: null, successMessage: null });
                    }
                }
            }).catch(error => {
                res.render('superadmin/detail-organization', { org: {}, users: [], orgPage: orgPage, pagination: {}, errorMessage: "System Error!", options: options, roles: roles, successMessage: null });
            })
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&page=' + orgPage + '&userPage=' + userPage )
			} else {
				res.render('superadmin/detail-organization', { org: {}, users: [], orgPage: {}, pagination: {}, errorMessage: "System Error!", options: options, roles: roles, successMessage: null });
			}            
        })
    }
}

exports.superadmins = (req, res) => {
    if (req.method == 'GET') {

        const page = req.query.page || 1

        axios.get(`${process.env.API_URL}/utils/users?page=${ page }`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            if (req.query.success) {
                if (req.query.type == 'user-create') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: null, successMessage: "Successfully created." });
                } else if (req.query.type == 'user-delete') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: null, successMessage: "Successfully deleted." });
                } else if (req.query.type == 'user-restore') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: null, successMessage: "Successfully restored." });
                }
            } else if (req.query.error) {
                if (req.query.type == 'user-create') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: "Cannot create at the moment!", successMessage: null });
                } else if (req.query.type == 'user-delete') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: "Cannot delete at the moment!", successMessage: null });
                } else if (req.query.type == 'user-restore') {
                    res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: "Cannot restore at the moment!", successMessage: null });
                } else if (req.query.type == '404Error') {
					res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: "404 User Not Found!", successMessage: null });
				} else if (req.query.type == 'sysError') {
					res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: "Internal Server Error!", successMessage: null });
				}
            } else {
                res.render('superadmin/superadmins', { users: response.data.data, pagination: response.data.pagination, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
            res.render('superadmin/superadmins', { users: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
        })
    }
}

exports.createUser = (req, res) => {
    if (req.method == 'POST') {
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage

        const options = [
            { id: 1, name: 'active' },
            { id: 2, name: 'deleted' },
            { id: 3, name: 'pending' }
        ];
        const roles = [
            {
                id: 1,
                name: 'admin'
            },
            {
                id: 2,
                name: 'manager'
            },
            {
                id: 3,
                name: 'staff'
            }
        ];
        const { name, email, password, role, phone } = req.body;
        const orgId = req.params.id
        const status = 'pending'

        axios.post(`${process.env.API_URL}/users/create`, { name, email, phone, password, role, orgId, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-create&orgPage=' + orgPage + '&userPage=' + userPage + '&aciveUsers=true')
        }).catch(error => {
            if (error.status === 409){
                res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=dup-email&orgPage=' + orgPage + '&userPage=' + userPage + '&aciveUsers=true')
            } else {
                res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=user-create&orgPage=' + orgPage + '&userPage=' + userPage + '&aciveUsers=true')
            }
        })
    }
}

exports.detailUser = (req , res) => {
    if ( req.method = "GET") {
        const userId = req.params.userId
		const orgId = req.params.id
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage
        const options = [
            { id: 1, name: 'active' },
            { id: 2, name: 'deleted' },
            { id: 3, name: 'pending'}
        ];
        axios.get (`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
			const id = response.data.data.orgId
			if (id == orgId) {
				res.render('superadmin/detail-user', {user: response.data.data, userPage: userPage, orgPage: orgPage, options: options, errorMessage: null});
			} else {
				res.redirect('/superadmin/organizations?error=true&type=404Error&orgpage=' + orgPage + '&userPage=' + userPage );
			}
            
        }).catch (error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			} else{
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			}
        })
    }
}

exports.deleteUser = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.userId
        const orgId = req.params.id
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage

        axios.delete(`${process.env.API_URL}/organizations/users/delete/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-delete&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			} else {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			}
            
        })
    }
}

exports.restoreUser = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.userId
        const orgId = req.params.id
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage

        axios.get(`${process.env.API_URL}/users/restore/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-restore&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
        }).catch(error => {
            if (error.status == 404) {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			} else {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgpage=' + orgPage + '&userPage=' + userPage )
			}
        })
    }
}

exports.updateUser = (req, res) => {
	if (req.method == 'GET') {
        const orgId = req.params.id
        const userId = req.params.userId
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage
		
        axios.get(`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' },
                { id: 3, name: 'pending' }
            ];
			const roles = [
				{ id: 1, name: 'admin' },
                { id: 2, name: 'manager' },
                { id: 3, name: 'staff' }
			];
            const success = req.query.success;
            const errorMsg = req.query.error;
            const type = req.query.type;
            if (success) {
                res.render('superadmin/edit-user', { user: response.data.data, userPage: userPage, orgPage: orgPage, options: options, roles: roles, errorMessage: null, successMessage: "Successfully Updated!" });
            } else if (errorMsg) {
                if ( type == "dup-email") {
                    res.render('superadmin/edit-user', { user: response.data.data, userPage: userPage, orgPage: orgPage, options: options, roles: roles, errorMessage: "Duplicate Email!", successMessage: null });
                } else {
                    res.render('superadmin/edit-user', { user: response.data.data, userPage: userPage, orgPage: orgPage, options: options, roles: roles, errorMessage: "Something went wrong!", successMessage: null });
                }
            } else {
                res.render('superadmin/edit-user', { user: response.data.data, userPage: userPage, orgPage: orgPage, options: options, roles: roles, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			if (error.status == 404)
			{
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgPage=' + orgPage + '&userPage=' + userPage );
			}
			else {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgPage=' + orgPage + '&userPage=' + userPage );
			}
            
        })
    } else {
        const orgId = req.params.id
		const userId = req.params.userId
        const orgPage = req.query.orgPage
        const userPage = req.query.userPage
        const { name, email, phone, status, role, orgName } = req.body;
        axios.put(`${process.env.API_URL}/users/${userId}`, { name, orgName, email, phone, role, status, orgId }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId +  '/' + userId + '?success=true&type=update&activeUsers=true&orgPage=' + orgPage + '&userPage=' + userPage )
        }).catch(error => {
            if (error.status === 409){
                res.redirect('/superadmin/organizations/update/' + orgId + '/' + userId + '?error=true&type=dup-email&orgPage=' + orgPage + '&userPage=' + userPage );
            } else {
                res.redirect('/superadmin/organizations/update/' + orgId + '/' + userId + '?error=true&type=404Error&activeUsers=true&orgPage=' + orgPage + '&userPage=' + userPage );
            }
        })
    }
}

exports.createSuperAdmins = (req, res) => {
    if (req.method == 'GET') {
        const page = req.query.page || 1
        if (req.query.error) {
			const name = req.query.name
			const phone = req.query.phone
			const email = req.query.email
			const userData = {name, phone, email}
            if ( req.query.type == 'dup-email') {
                res.render('superadmin/add-superadmin', { user: userData, page: page, errorMessage: "Duplicate error!" });
            } else {
                res.render('superadmin/add-superadmin', { user: userData, page: page, errorMessage: "Internal server error!" });
            }
        } else if (req.query.success) {
            res.render('superadmin/add-superadmin', { user: "", page: page, errorMessage: null });
        } else {
            res.render('superadmin/add-superadmin', { user: "", page: page, errorMessage: null });
        }
    } else 
        if (req.method == 'POST') {
            const role = "superadmin"
            const { name, email, password, phone } = req.body;
            const orgId = 0
            const status = 'pending'
            const page = req.query.page || 1

            axios.post(`${process.env.API_URL}/utils/register`, { name, email, phone, password, role, orgId, status }, {
                headers: {
                    'Authorization': `${req.session.token}`
                }
            }).then(response => {
                res.redirect('/superadmin/users?success=true&type=user-create&page=' + page)
            }).catch(error => {
                if (error.status === 409){
                    res.redirect('/superadmin/add-superadmin?error=true&type=dup-email&name=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page)
                } else {
                    res.redirect('/superadmin/add-superadmin?error=true&type=user-create&name=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page)
                }
            })
        }
        
}

exports.detailSuperadmin = (req , res) => {
    if ( req.method = "GET") {
        const userId = req.params.id
        const page = req.query.page || 1
        const options = [
            { id: 1, name: 'active' },
            { id: 2, name: 'deleted' }
        ];
        axios.get (`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.render('superadmin/detail-superadmin', {user: response.data.data, page: page, options: options, errorMessage: null})
        }).catch (error => {
			if (error.status === 404) {
				res.redirect('/superadmin/users?error=true&type=404Error&page=' + page)
			} else {
				res.redirect('/superadmin/users?error=true&type=sysError&page=' + page)
			}
        })
    }
}

exports.deleteSuperadmin = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.id
        const page = req.query.page || 1
        axios.delete(`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users?success=true&type=user-delete&page=' + page )
        }).catch(error => {
            res.redirect('/superadmin/users?error=true&type=user-delete&page=' + page);
        })
    }
}

exports.restoreSuperadmin = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.id
        const page = req.query.page || 1
        axios.get(`${process.env.API_URL}/users/restore/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users?success=true&type=user-restore&page=' + page )
        }).catch(error => {
            res.redirect('/superadmin/users?error=true&type=user-restore&page=' + page );
        })
    }
}

exports.updateSuperadmin = (req, res) => {
	if (req.method == 'GET') {
        const userId = req.params.id
		const page = req.query.page || 1
        axios.get(`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' }
            ];
            const success = req.query.success;
			const errorMsg = req.query.error;
			const type = req.query.type;
			if (response.data.data['orgId'] !== 0) {
				throw error
			}
            if ( errorMsg ) {
                if (type === "dup-email") {
					res.render('superadmin/edit-superadmin', { user: response.data.data, page: page, options: options, errorMessage: "Duplicate Email!", successMessage: null });
				} else if(type === "sysError") {
                	res.render('superadmin/edit-superadmin', { user: response.data.data, page: page, options: options,  errorMessage: "Internal Server Error!", successMessage: null });
				}
            } else if (success) {
                res.render('superadmin/edit-superadmin', { user: response.data.data, page: page, options: options, errorMessage: null, successMessage: "Successfully Updated!" });
            } else {
                res.render('superadmin/edit-superadmin', { user: response.data.data, page: page, options: options, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			if (error.status === 404) {
				res.redirect('/superadmin/users?error=true&type=404Error&page='+ page);
			} else {
				res.redirect('/superadmin/users?error=true&type=sysError&page='+ page);
			}
        })
    } else {
        const orgId = 0
		const userId = req.params.id
        const page = req.query.page || 1
		const role = "superadmin"
        const { name, email, phone, status } = req.body;
        axios.put(`${process.env.API_URL}/users/${userId}`, { name, email, phone, role, status, orgId }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users/update/' + userId + '?success=true&type=update&page='+ page)
        }).catch(error => {
			if (error.status === 409){
           		res.redirect('/superadmin/users/update/' + userId + '?error=true&type=dup-email&page='+ page);
			} else {
				res.redirect('/superadmin/users/update/' + userId + '?error=true&type=sysError&page='+ page);
			}
        })
    }
}