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
        axios.get(`${process.env.API_URL}/organizations`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            const error = req.query.error;
            const type = req.query.type;

            const options = [
                { id: 1, name: 'active' },
                { id: 2, name: 'deleted' }
            ];
            if (error) {
                if (type == 'register') {
                    res.render('superadmin/organizations', { orgs: response.data.data, options: options, errorMessage: "Cannot register at the moment!" });
                }
            } else {
                res.render('superadmin/organizations', { orgs: response.data.data, options: options, errorMessage: null });
            }

        }).catch(error => {
            res.render('superadmin/organizations', { orgs: [], options: options, errorMessage: "System Error!" });
        })
    }
}

exports.restoreOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id

        axios.get(`${process.env.API_URL}/organizations/restore/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations')
        }).catch(error => {
            // console.log(error)
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: [], errorMessage: "Cannot restore at the moment!" });
        })
    }
}

exports.deleteOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id

        axios.delete(`${process.env.API_URL}/organizations/delete/${orgId}`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations')
        }).catch(error => {
            // console.log(error)
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: [], errorMessage: "Cannot restore at the moment!" });
        })
    }
}

exports.updateOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
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
            if (success) {
                if (type == 'update') {
                    res.render('superadmin/edit-organization', { org: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Updated!" });
                } else {
                    res.render('superadmin/edit-organization', { org: response.data.data, options: options, errorMessage: null, successMessage: "Successfully Extended!" });
                }
            } else {
                res.render('superadmin/edit-organization', { org: response.data.data, options: options, errorMessage: null, successMessage: null });
            }
        }).catch(error => {
            res.render('superadmin/edit-organization', { org: {}, errorMessage: "System Error!", successMessage: null });
        })
    } else {
        const orgId = req.params.id
        const { name, address, phone, status } = req.body;
        axios.put(`${process.env.API_URL}/organizations/update/${orgId}`, { name, address, phone, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=update')
        }).catch(error => {
            res.render('/superadmin/organizations/update/' + orgId, { org: {}, errorMessage: "System Error!" });
        })
    }

}

exports.extendLicense = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const num = req.query.num
        const type = req.query.type
        axios.put(`${process.env.API_URL}/organizations/license/${orgId}`, { num, type }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId + '?success=true&type=license')
        }).catch(error => {
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: [], errorMessage: "Cannot restore at the moment!" });
        })
    }
}


exports.registerOrg = (req, res) => {
    if (req.method == 'POST') {

        const { name, address, phone, status } = req.body;
        axios.post(`${process.env.API_URL}/organizations/create`, { name, address, phone, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations')
        }).catch(error => {
            console.log(error)
            res.redirect('/superadmin/organizations?error=true&type=register')
        })
    }
}


exports.detailOrg = (req, res) => {
    if (req.method == 'GET') {
        const orgId = req.params.id
        const error = req.query.error
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

            axios.get(`${process.env.API_URL}/organizations/users/${orgId}`, {
                headers: {
                    'Authorization': `${req.session.token}`
                }
            }).then(users => {
                if (error) {
                    if (req.query.type == 'user-create') {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, options: options, roles: roles, errorMessage: "Cannot create user at the moment!", successMessage: null });
                    } else {
                        res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, options: options, roles: roles, errorMessage: "System Error!", successMessage: null });
                    }
                } else {
                    res.render('superadmin/detail-organization', { org: response.data.data, users: users.data.data, options: options, roles: roles, errorMessage: null, successMessage: null });
                }


            }).catch(error => {
                res.render('superadmin/detail-organization', { org: {}, errorMessage: "System Error!", options: options, roles: roles, successMessage: null });
            })
        }).catch(error => {
            res.render('superadmin/detail-organization', { org: {}, errorMessage: "System Error!", options: options, roles: roles, successMessage: null });
        })
    }
}


exports.superadmins = (req, res) => {
    if (req.method == 'GET') {
        axios.get(`${process.env.API_URL}/utils/users`, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.render('superadmin/superadmins', { users: response.data.data, errorMessage: null });

        }).catch(error => {
            res.render('superadmin/superadmins', { users: [], errorMessage: "System Error!" });
        })
    }
}

exports.createUser = (req, res) => {
    if (req.method == 'POST') {

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
        const { name, email, password, role, phone } = req.body;
        const orgId = req.params.id
        const status = 'pending'

        axios.post(`${process.env.API_URL}/users/create`, { name, email, phone, password, role, orgId, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/detail/' + orgId)
        }).catch(error => {
            res.redirect('/superadmin/organizations/detail/' + orgId + '?error=true&type=user-create')
        })
    }

}