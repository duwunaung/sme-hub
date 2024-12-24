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
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: response.data.data, errorMessage: null });
        }).catch(error => {
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: [], errorMessage: "System Error!" });
        })
    } else if (req.method == 'POST'){
        const { name, address, phone } = req.body;
        
        axios.post(`${process.env.API_URL}/organizations/create`, { name, address, phone }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations');
        }).catch(error => {
            res.render('superadmin/organizations', { errorMessage: "System Error!" });
        });
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
    if(req.method == 'GET') {
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
            res.render('superadmin/edit-organization', { org: response.data.data, options: options, errorMessage: null });
        }).catch(error => {
            res.render('superadmin/edit-organization', { org: {}, errorMessage: "System Error!" });
        })
    } else {
        const orgId = req.params.id
        const { name, address, phone, status } = req.body;
        axios.put(`${process.env.API_URL}/organizations/update/${orgId}`, { name, address, phone, status }, {
            headers: {
                'Authorization': `${req.session.token}`
            }
        }).then(response => {
            res.redirect('/superadmin/organizations/update/' + orgId)
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
            res.redirect('/superadmin/organizations/update/' + orgId)
        }).catch(error => {
            res.render('superadmin/organizations', { token: req.session.token, user: req.session.user, orgs: [], errorMessage: "Cannot restore at the moment!" });
        })
    }
}

// exports.addNewOrg = (req, res) => {
//     if (req.method == 'GET') {
//         res.render('superadmin/organizations', { errorMessage: null });
//     } else if (req.method == 'POST'){
//         const { name, address, phone } = req.body;
        
//         axios.post(`${process.env.API_URL}/organizations/create`, { name, address, phone }, {
//             headers: {
//                 'Authorization': `${req.session.token}`
//             }
//         }).then(response => {
//             res.redirect('/superadmin/organizations');
//         }).catch(error => {
//             res.render('superadmin/organizations', { errorMessage: "System Error!" });
//         });
//     }
// }
