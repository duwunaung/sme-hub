const axios = require('axios');

exports.login = (req, res) => {
    if (req.method === 'POST') {
        const { email, password } = req.body;
        try {
            // console.log(`${process.env.API_URL}/utils/login`)
            axios.post(`${process.env.API_URL}/utils/login`, { email, password })
                .then(response => {
                    if (response.data.success) {
                        req.session.token = response.data.data.token;
                        req.session.user = response.data.data.name;
                        console.log(req.session)
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
                console.error('Error during logout:', err);
                return res.redirect('/'); // Redirect to home on error
            }
            res.redirect('login'); // Redirect to login after successful logout
        });
    } else {
        res.redirect('login'); // If no session, redirect to login
    }
}