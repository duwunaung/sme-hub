const axios = require('axios');
const { query } = require('express');
const bcrypt = require('bcryptjs');
const { resolve } = require('path');

exports.dashboard = (req, res) => {
	if (req.method == 'GET') {
        axios.get(`${process.env.API_URL}/dashboard`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.render('superadmin/dashboard', { data: response.data.data, userName: req.session.user, userRole: req.session.role, token: req.session.token, user: req.session.user });
        }).catch(error => {
            res.render('superadmin/dashboard', { userName: req.session.user, userRole: req.session.role, token: req.session.token, user: req.session.user });
        })
    }
}

exports.login = (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;
        try {
            axios.post(`${process.env.API_URL}/utils/login`, { email, password })
                .then(response => {
                    if (response.data.success) {
                        req.session.token = response.data.data.token;
                        req.session.user = response.data.data.name;
                        req.session.role = response.data.data.role;
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
        const name = req.query.orgName || ""
        const expired = req.query.expired || 'false'
        const status = req.query.orgStatus || 'all'
        const page = req.query.orgPage || 1
        axios.get(`${process.env.API_URL}/organizations?page=${page}&name=${name}&expired=${expired}&status=${status}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const error = req.query.error;
            const type = req.query.type;
			const success = req.query.success;
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' },
                { id: 3, name: 'pending' }
            ];
            if (error) {
                if (type == 'register') {
                    res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, options: options, errorMessage: "Cannot register at the moment!" , successMessage: null});
                } else if (type == '404Error') {
                    res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, options: options, errorMessage: "404 Organization Not Found!" , successMessage: null});
                } else if (type == 'sysError') {
                    res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, options: options, errorMessage: "Internal Server Error!" , successMessage: null});
                }
            } else if (success) {
				if (type === 'register') {
					res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, status: status, options: options, errorMessage: null , successMessage: "Successfully created!"});
				} else if (type === 'org-delete') {
					res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, status: status, options: options, errorMessage: null , successMessage: "Successfully deleted!"});
				} else if (type === 'org-restore') {
					res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, status: status, options: options, errorMessage: null , successMessage: "Successfully restored!"});
				}
            }
			else {
                res.render('superadmin/organizations', { userName: req.session.user, userRole: req.session.role, orgs: response.data.data, pagination: response.data.pagination, name: name, status: status, options: options, errorMessage: null , successMessage: null});
            }
        }).catch(error => {
            res.render('superadmin/organizations', { orgs: [], name: {}, status: {}, options: [], pagination: {}, errorMessage: "System Error!", successMessage: null });
        })
    }
}

exports.restoreOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const page = req.query.orgPage || 1
        const name = req.query.orgName || ""
        const expired = req.query.expired || 'false'
        const status = req.query.orgStatus || 'all'

        axios.get(`${process.env.API_URL}/organizations/restore/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=org-restore&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
        }).catch(error => {
            if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
			}
			else {
				res.redirect('/superadmin/organizations?error=true&type=sysError&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
			}
        })
    }
}

exports.deleteOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const page = req.query.orgPage || 1
        const name = req.query.orgName || ""
        const expired = req.query.expired || 'false'
        const status = req.query.orgStatus || 'all'

        axios.delete(`${process.env.API_URL}/organizations/delete/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=org-delete&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
			}
			else {
				res.redirect('/superadmin/organizations?error=true&type=sysError&orgPage=' + page + '&orgName=' + name + '&expired=' + expired + '&orgStatus=' + status )
			}
            
        })
    }
}

exports.updateOrg = (req, res) => {    
    const orgId = req.params.id
    const orgPage = req.query.orgPage || 1
    const orgName = req.query.orgName || ''
    const orgStatus = req.query.orgStatus || 'all'
    const expired = req.query.expired || 'false'

    if (req.method == 'GET') {
        axios.get(`${process.env.API_URL}/organizations/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' },
                { id: 3, name: 'pending' }
            ];
            const success = req.query.success;
            const type = req.query.type;
			const error = req.query.error;
            if (success) {
                if (type == 'update') {
                    res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Updated!" });
                } else if (type == 'extendLicense') {
                    res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Extended!" });
                } else if (type == 'reduceLicense') {
                    res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Reduced!" });
                }
            } else if (error) {
				if (type == 'sysError') {
					res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: "Internal Server Error!", successMessage: null });
				} else if (type == '406Error') {
					res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: "Cannot Accept Your Request!", successMessage: null });
				}
			}
			else {
                res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, options: options, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&orgPage=' + orgPage + '&orgName=' + orgName + '&expired=' + expired + '&orgStatus=' + orgStatus )
			} else {
				res.render('superadmin/edit-organization', { userName: req.session.user, userRole: req.session.role, org: {}, errorMessage: "System Error!", successMessage: null });
			}
            
        })
    } else {        
        const { name, address, phone, status, country } = req.body;
        axios.put(`${process.env.API_URL}/organizations/update/${orgId}`, { name, address, phone, status , country}, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=update&orgPage=' + orgPage  + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired );
        }).catch(error => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=sysError&orgPage=' + orgPage  + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired );
        })
    }
}

exports.extendLicense = (req, res) => {
    if (req.method == 'GET') {
        
        const orgId = req.params.id
        const orgPage = req.query.orgPage || 1
        const orgName = req.query.orgName || ''
        const orgStatus = req.query.orgStatus || 'all'
        const expired = req.query.expired || 'false'

        const num = req.query.num
        const type = req.query.type

        axios.put(`${process.env.API_URL}/organizations/license/${orgId}`, { num, type }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
			if (num < 0)
			{
				res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=reduceLicense&orgPage=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired )
			} else {
				res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=extendLicense&orgPage=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired )
			}
        }).catch(error => {
			if (error.status == 406){
				res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=406Error&orgPage=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired )
			} else {
				res.redirect('/superadmin/organizations/update/' + orgId + '?error=true&type=sysError&orgPage=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired )
			}
        })
    }
}

exports.registerOrg = (req, res) => {
    if (req.method == 'POST') {
        const page = req.query.page
        const { name, address, phone, status, country } = req.body;
        axios.post(`${process.env.API_URL}/organizations/create`, { name, address, phone, status, country }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations?success=true&type=register&page=1' )
        }).catch(error => {
            res.redirect('/superadmin/organizations?error=true&type=register&page=' + page )
        })
    }
}

exports.detailOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const error = req.query.error
        
        const orgPage = req.query.orgPage || 1
        const orgName = req.query.orgName || ''
        const orgStatus = req.query.orgStatus || 'all'
        const expired = req.query.expired || 'false'

        const userPage = req.query.userPage || 1
        const userName = req.query.userName || ""
        const userStatus = req.query.userStatus || 'all'
        const userRole = req.query.userRole || 'allRoles'

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
        ]
        axios.get(`${process.env.API_URL}/organizations/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            axios.get(`${process.env.API_URL}/organizations/users/${orgId}?page=${userPage}&name=${userName}&status=${userStatus}&role=${userRole}`, {
                headers: {
                    'Authorization': `${req.session.token}`
                }
            }).then( users => {
                if (error) {
                    if (req.query.type == 'user-create') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "Cannot create user at the moment!", successMessage: null });
                    } else if (req.query.type == 'user-delete') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "Cannot delete user at the moment!", successMessage: null });
                    } else if (req.query.type == 'user-restore') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "Cannot restore user at the moment!", successMessage: null });
                    } else if (req.query.type == 'dup-email') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "Duplicate Email!", successMessage: null });
                    } else if (req.query.type == '404Error') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "404 User Not Found!", successMessage: null });
                    } else {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: "Internal Server Error!", successMessage: null });
                    }
                } else {
                    if (req.query.type == 'user-create') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: null, successMessage: "User Created" });
                    } else if (req.query.type == 'user-delete') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: null, successMessage: "User Deleted" });
                    } else if (req.query.type == 'user-restore') {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: null, successMessage: "User Restored" });
                    } else {
                        res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: response.data.data, users: users.data.data, name: userName, orgPage: orgPage, pagination: users.data.pagination, options: options, status: userStatus, role: userRole, roles: roles, errorMessage: null, successMessage: null });
                    }
                }
            }).catch(error => {
                res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: {}, users: [], name: {}, orgPage: orgPage, pagination: {}, errorMessage: "System Error!", options: options, status: userStatus, role: userRole, roles: roles, successMessage: null });
            })
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations?error=true&type=404Error&page=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired' + expired + '&userPage=' + userPage + '&userStatus=' + userStatus + '&userRole=' + userRole + '&userName=' + userName )
			} else {
				res.render('superadmin/detail-organization', { userName: req.session.user, userRole: req.session.role, org: {}, users: [], name: {}, orgPage: {}, status: {}, role: {}, pagination: {}, errorMessage: "System Error!", options: options, roles: roles, successMessage: null });
			}            
        })
    }
}

exports.superadmins = (req, res) => {
    if (req.method == 'GET') {

        const page = req.query.page || 1
        const name = req.query.name || ""
        const status = req.query.status || 'all'

        axios.get(`${process.env.API_URL}/utils/users?page=${page}&name=${name}&status=${status}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            if (req.query.success) {
                if (req.query.type == 'user-create') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: null, successMessage: "Successfully created." });
                } else if (req.query.type == 'user-delete') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: null, successMessage: "Successfully deleted." });
                } else if (req.query.type == 'user-restore') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: null, successMessage: "Successfully restored." });
                }
            } else if (req.query.error) {
                if (req.query.type == 'user-create') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: "Cannot create at the moment!", successMessage: null });
                } else if (req.query.type == 'user-delete') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: "Cannot delete at the moment!", successMessage: null });
                } else if (req.query.type == 'user-restore') {
                    res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: "Cannot restore at the moment!", successMessage: null });
                } else if (req.query.type == '404Error') {
					res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: "404 User Not Found!", successMessage: null });
				} else if (req.query.type == 'sysError') {
					res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: "Internal Server Error!", successMessage: null });
				}
            } else {
                res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: response.data.data, pagination: response.data.pagination, name: name, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
            res.render('superadmin/superadmins', { userName: req.session.user, userRole: req.session.role, users: [], pagination: {}, name: {}, errorMessage: "System Error!", successMessage: null });
        })
    }
}

exports.createUser = (req, res) => {
    if (req.method == 'POST') {
        const orgPage = req.query.orgPage
        const orgName = req.query.orgName || ""
        const orgStatus = req.query.orgStatus || "all"
        const expired = req.query.expired || false

        const userPage = req.query.userPage || 1
        const userName = req.query.userName || ""
        const userStatus = req.query.userStatus || 'all'
        const userRole = req.query.userRole || 'allRoles'

        const { name, email, password, role, phone } = req.body;
        const orgId = req.params.id
        const status = 'active'

        axios.post(`${process.env.API_URL}/users/create`, { name, email, phone, password, role, orgId, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
                res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-create&orgPage=' + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=1&userStatus=' + userStatus + '&userRole=' + userRole + '&userName=' + userName + '&aciveUsers=true')
        }).catch(error => {
            if (error.status === 409){
                res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=dup-email&orgPage='  + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userStatus=' + userStatus + '&userRole=' + userRole + '&userName=' + userName + '&aciveUsers=true')
            } else {
                res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=user-create&orgPage='  + orgPage + '&orgName=' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userStatus=' + userStatus + '&userRole=' + userRole + '&userName=' + userName + '&aciveUsers=true')
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
            { id: 3, name: 'pending' }
        ];
        axios.get (`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
			const id = response.data.data.orgId
			if (id == orgId) {
				res.render('superadmin/detail-user', { userName: req.session.user, userRole: req.session.role, user: response.data.data, options: options, errorMessage: null});
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
        const orgName = req.query.orgName || ""
        const orgStatus = req.query.orgStatus || "all"
        const expired = req.query.expired || false

        const userPage = req.query.userPage || 1
        const userName = req.query.userName || ""
        const userStatus = req.query.userStatus || "all"
        const userRole = req.query.userRole || "allRoles"

        axios.delete(`${process.env.API_URL}/organizations/users/delete/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-delete&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
        }).catch(error => {
			if (error.status == 404) {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
			} else {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
			}
        })
    }
}

exports.restoreUser = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.userId
        const orgId = req.params.id

        const orgPage = req.query.orgPage
        const orgName = req.query.orgName || ""
        const orgStatus = req.query.orgStatus || "all"
        const expired = req.query.expired || false

        const userPage = req.query.userPage || 1
        const userName = req.query.userName || ""
        const userStatus = req.query.userStatus || "all"
        const userRole = req.query.userRole || "allRoles"

        axios.get(`${process.env.API_URL}/users/restore/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?success=true&type=user-restore&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
        }).catch(error => {
            if (error.status == 404) {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=404Error&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
			} else {
				res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=sysError&activeUsers=true&orgPage=' + orgPage + '&orgName' + orgName + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
			}
        })
    }
}

exports.updateUser = (req, res) => {
    const orgId = req.params.id
    const userId = req.params.userId
    
    const orgPage = req.query.orgPage
    const userPage = req.query.userPage || 1

	if (req.method == 'GET') {
		
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
                res.render('superadmin/edit-user', { userName: req.session.user, userRole: req.session.role, user: response.data.data, orgId: orgId, options: options, roles: roles, errorMessage: null, successMessage: "Successfully Updated!" });
            } else if (errorMsg) {
				const name = req.query.name
				const phone = req.query.phone
				const email = req.query.email
				const userData = {name, phone, email}
                const orgId = req.params.id
                if ( type == "dup-email") {
                    res.render('superadmin/edit-user', { userName: req.session.user, userRole: req.session.role, user: userData, orgId: orgId, options: options, roles: roles, errorMessage: "Duplicate Email!", successMessage: null });
                } else {
                    res.render('superadmin/edit-user', { userName: req.session.user, userRole: req.session.role, user: userData, orgId: orgId, options: options, roles: roles, errorMessage: "Something went wrong!", successMessage: null });
                }
            } else {
                res.render('superadmin/edit-user', { userName: req.session.user, userRole: req.session.role, user: response.data.data, orgId: orgId, options: options, roles: roles, errorMessage: null, successMessage: null });
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
        const { name, email, phone, status, role, orgName } = req.body;

        const org = req.query.orgName
        const orgStatus = req.query.orgStatus
        const expired = req.query.expired

        const userName = req.query.userName || ""
        const userStatus = req.query.userStatus || "all"
        const userRole = req.query.userRole || "allRoles"
        
        axios.put(`${process.env.API_URL}/users/${userId}`, { name, orgName, email, phone, role, status, orgId }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId +  '/' + userId + '?success=true&type=update&activeUsers=true&orgPage=' + orgPage + '&orgName=' + org + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole )
        }).catch(error => {
            if (error.status === 409){
                res.redirect('/superadmin/organizations/update/' + orgId + '/' + userId + '?error=true&type=dup-email&activeUsers=true&orgPage=' + orgPage + '&orgName' + org + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole + '&name=' + name + '&email=' + email +  '&phone=' + phone );
            } else {
                res.redirect('/superadmin/organizations/update/' + orgId + '/' + userId + '?error=true&type=404Error&activeUsers=true&orgPage=' + orgPage + '&orgName' + org + '&orgStatus=' + orgStatus + '&expired=' + expired + '&userPage=' + userPage + '&userName=' + userName + '&userStatus=' + userStatus + '&userRole=' + userRole + '&name=' + name + '&email=' + email +  '&phone=' + phone );
            }
        })
    }
}

exports.createSuperAdmins = (req, res) => {
    if (req.method == 'GET') {
        const page = req.query.page
        if (req.query.error) {
			const name = req.query.userName
			const phone = req.query.phone
			const email = req.query.email
			const userData = {name, phone, email}
            if ( req.query.type == 'dup-email') {
                res.render('superadmin/add-superadmin', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Duplicate error!" });
            } else {
                res.render('superadmin/add-superadmin', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Internal server error!" });
            }
        } else if (req.query.success) {
            res.render('superadmin/add-superadmin', { userName: req.session.user, userRole: req.session.role, user: "", errorMessage: null });
        } else {
            res.render('superadmin/add-superadmin', { userName: req.session.user, userRole: req.session.role, user: "", errorMessage: null });
        }
    } else 
        if (req.method == 'POST') {
            const role = "superadmin"
            const { name, email, password, phone } = req.body;
            const orgId = 0
            const status = 'pending'

            const urlName = req.query.name || ""
            const urlStatus = req.query.status || ""
            
            const page = req.query.page

            axios.post(`${process.env.API_URL}/utils/register`, { name, email, phone, password, role, orgId, status }, {
                headers: {
                    'Authorization': `${req.session.token}`
                }
            }).then(response => {
                res.redirect('/superadmin/users?success=true&type=user-create&page=1' )
            }).catch(error => {
                if (error.status === 409){
                    res.redirect('/superadmin/add-superadmin?error=true&type=dup-email&userName=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page + "&name=" + urlName + "&status=" + urlStatus )
                } else {
                    res.redirect('/superadmin/add-superadmin?error=true&type=user-create&name=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page + "&name=" + urlName + "&status=" + urlStatus )
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
            { id: 2, name: 'deleted' },
            { id: 3, name: 'pending' }
        ];
        axios.get (`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.render('superadmin/detail-superadmin', { userName: req.session.user, userRole: req.session.role, user: response.data.data, page: page, options: options, errorMessage: null})
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
        const name = req.query.name || ""
        const status = req.query.status || "all"

        axios.delete(`${process.env.API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users?success=true&type=user-delete&page=' + page + "&name=" + name + "&status=" + status );
        }).catch(error => {
            res.redirect('/superadmin/users?error=true&type=user-delete&page=' + page + "&name=" + name + "&status=" + status );
        })
    }
}

exports.restoreSuperadmin = (req, res) => {
    if (req.method == 'GET') {
        const userId = req.params.id
        const page = req.query.page || 1
        const name = req.query.name || ""
        const status = req.query.status || 'all'
        axios.get(`${process.env.API_URL}/users/restore/${userId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users?success=true&type=user-restore&page=' + page + "&name=" + name + "&status=" + status )
        }).catch(error => {
            res.redirect('/superadmin/users?error=true&type=user-restore&page=' + page + "&name=" + name + "&status=" + status );
        })
    }
}

exports.updateSuperadmin = (req, res) => {
	if (req.method == 'GET') {
        const userId = req.params.id
		const page = req.query.page || 1
        const urlName = req.query.name || ""
        const urlStatus = req.query.status || "all"

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
            const success = req.query.success;
			const errorMsg = req.query.error;
			const type = req.query.type;
			if (response.data.data['orgId'] !== 0) {
				throw error
			}
            if ( errorMsg ) {
				const name = req.query.uName
				const phone = req.query.phone
				const email = req.query.email
				const userData = {name, phone, email}
                if (type === "dup-email") {
					res.render('superadmin/edit-superadmin', { userName: req.session.user, userRole: req.session.role, user: userData, options: options, errorMessage: "Duplicate Email!", successMessage: null });
				} else if(type === "sysError") {
                	res.render('superadmin/edit-superadmin', { userName: req.session.user, userRole: req.session.role, user: userData, options: options,  errorMessage: "Internal Server Error!", successMessage: null });
				}
            } else if (success) {
                res.render('superadmin/edit-superadmin', { userName: req.session.user, userRole: req.session.role, user: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Updated!" });
            } else {
                res.render('superadmin/edit-superadmin', { userName: req.session.user, userRole: req.session.role, user: response.data.data, options: options, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			if (error.status === 404) {
				res.redirect('/superadmin/users?error=true&type=404Error&page=' + page + '&name=' + urlName + '&status=' + urlStatus );
			} else {
				res.redirect('/superadmin/users?error=true&type=sysError&page=' + page + '&name=' + urlName + '&status=' + urlStatus );
			}
        })
    } else {
        const orgId = 0
		const userId = req.params.id
        const page = req.query.page || 1
        const urlName = req.query.name || ""
        const urlStatus = req.query.status || "all"

		const role = "superadmin"
        const { name, email, phone, status } = req.body;
        axios.put(`${process.env.API_URL}/users/${userId}`, { name, email, phone, role, status, orgId }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/users/update/' + userId + '?success=true&type=update&page=' + page + '&name=' + urlName + '&status=' + urlStatus)
        }).catch(error => {
			if (error.status === 409){
           		res.redirect('/superadmin/users/update/' + userId + '?error=true&type=dup-email&uName=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page + '&name=' + urlName + '&status=' + urlStatus);
			} else {
				res.redirect('/superadmin/users/update/' + userId + '?error=true&type=sysError&uName=' + name + '&email=' + email +  '&phone=' + phone + '&page=' + page + '&name=' + urlName + '&status=' + urlStatus);
			}
        })
    }
}

exports.adminProfile = (req, res) => {
	if (req.method == 'GET') {
        axios.get(`${process.env.API_URL}/users/profile/get`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const success = req.query.success
            const error = req.query.error
            const type = req.query.type

            if (success) {
                if (type == 'updateProfile') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: response.data.data, errorMessage: null, successMessage: "Successfully Updated" });
                }
            } else if (error) {
                const name = req.query.name
                const email = req.query.email
                const phone = req.query.phone
                const role = 'superadmin'
                const userData = { name, email, phone, role }

                if (type == 'dup-email') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Duplicate Email!", successMessage: null });
                } else if (type == '404Error') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "User not found!", successMessage: null });
                } else if (type == 'empty-value') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Input field shouldn't be empty!", successMessage: null });
                } else if (type == 'deleteAccount') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Cannot delete your account at the moment!", successMessage: null });
                } else if (type == 'invalidPassword') {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Invalid Password!", successMessage: null });
                } else {
                    res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: userData, errorMessage: "Internal Server Error!", successMessage: null });
                }
            } else {
                res.render('superadmin/profile', { userName: req.session.user, userRole: req.session.role, user: response.data.data, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
			res.render('superadmin/login', { userName: req.session.user, userRole: req.session.role, errorMessage: error.response.data.message });
        })
    } else {
        const updateProfile = async () => {
            const { name, email, phone } = req.body
            const { currentPassword, newPassword, confirmPassword } = req.body
            let parameters = { name, email, phone }
            try {
                if (currentPassword) {
                    const resPass = await axios.get(`${process.env.API_URL}/users/profile/check`, {
                        headers: {
                            'Authorization': `${req.session.token}`
                        }
                    });
                    
                    const hashedPassword = resPass.data.data.password;
                    const isPasswordValid = await bcrypt.compare(currentPassword, hashedPassword);
                    if (!isPasswordValid) {
                        return res.redirect('/superadmin/profile?error=true&type=invalidPassword&name=' + name + '&email=' + email + '&phone=' + phone );
                    }
                    if ((newPassword) && (newPassword === confirmPassword)) {
                        parameters.password = await bcrypt.hash(newPassword, 10);
                    }
                }
                // xxx
                await axios.put(
                    `${process.env.API_URL}/users/profile/update`, parameters, {
                        headers: {
                            'Authorization': `${req.session.token}`
                        }
                    }
                );
                res.redirect('/superadmin/profile?success=true&type=updateProfile');
            } catch (error) {
                if (error.status == 409) {
                    res.redirect('/superadmin/profile?error=true&type=dup-email&name=' + name + '&email=' + email + '&phone=' + phone );
                } else if (error.status == 400) {
                    res.redirect('/superadmin/profile?error=true&type=empty-value&name=' + name + '&email=' + email + '&phone=' + phone );
                } else {
                    res.redirect('/superadmin/profile?error=true&type=sysError&name=' + name + '&email=' + email + '&phone=' + phone );
                }
            }
        };
        updateProfile();
    }
}

exports.deleteAccount = (req,res) => {
    if (req.method == 'GET') {
        axios.delete(`${process.env.API_URL}/users/profile/delete`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
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
        }).catch(error => {
            res.redirect('/superadmin/profile?error=true&type=deleteAccount')
        })
    }
}