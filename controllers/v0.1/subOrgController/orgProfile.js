const db_connection = require('../../../utils/connection')
const moment = require('moment')

exports.getOrgProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "The Superadmin tried to access organization profile page"
        })
    }

    const orgId = req.user.orgId
    db_connection.query("SELECT id, name, address, phone, baseCurrency, logo, expiredDate, baseCountry FROM orgs WHERE id = ?", [orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Here is the organization',
            dev: "Good Job, Bro!",
            data: results[0]
        })
    })
};

exports.updateOrgProfile = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from super organization"
        })
    }

    const orgId = req.user.orgId
    const { name, address, phone, baseCurrency, country } = req.body
	if (!name || !address || !phone || !baseCurrency || !country) {
		return res.status(400).send(
			{
				success: false,
                message: 'All fields are required',
                dev: "Bro, give me correct ones"
			}
		)
	}

	const parameters = []
	parameters.push(name)
	parameters.push(address)
	parameters.push(phone)
	parameters.push(baseCurrency)
	parameters.push(country)
	let sql = ''
	
	const logo = req.body.logo
	if (!logo) {
		sql = "UPDATE orgs SET name = ?, address = ?, phone = ?, baseCurrency = ? , baseCountry = ? WHERE id = ?"
		parameters.push(orgId)
	}  else {
		sql = "UPDATE orgs SET name = ?, address = ?, phone = ?, baseCurrency = ?, baseCountry = ? , logo = ? WHERE id = ?"
		parameters.push(logo)
		parameters.push(orgId)
	}
    db_connection.query(sql, parameters, (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Organization updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                logo: logo,
				baseCurrency: baseCurrency
            }
        })
    })
}