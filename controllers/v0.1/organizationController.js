const e = require('express')
const db_connection = require('../../utils/connection')
const { calculatedExpiryDate } = require("../../utils/others")

exports.listOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }
    const { name, status = 'active', page = 1, pageSize = 10, expired = false } = req.query

    let query = "SELECT * FROM orgs WHERE 1=1"
    let queryParams = []

    if (name) {
        query += " AND name LIKE ?"
        queryParams.push(`%${name}%`)
    }

    if (status) {
        query += " AND status LIKE ?"
        queryParams.push(`%${status}%`)
    }

    if (!expired) {
        query += " AND expiredDate > NOW()"
    } else {
        query += " AND expiredDate < NOW()"
    }

    const offset = (page - 1) * pageSize
    query += ' LIMIT ? OFFSET ?'
    queryParams.push(parseInt(pageSize), offset)

    db_connection.query(query, queryParams, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        db_connection.query("SELECT COUNT(*) as total FROM orgs", (err, count) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }

            res.status(200).send({
                success: true,
                data: results,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: count[0].total,
                    totalPage: Math.ceil(count[0].total / pageSize)
                }
            })
        })
    })
}

exports.createOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const expiry = calculatedExpiryDate()
    const { name, address, phone } = req.body
    db_connection.query("INSERT INTO orgs (name, address, phone, expiredDate, status) VALUES (?,?,?,?,?)", [name, address, phone, expiry, "active"], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Organization created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                address: address,
                phone: phone,
                status: 'active',
                expiredDate: expiry
            }
        })
    })
}

exports.updateOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    const { name, address, phone, expiredDate } = req.body

    const expiry = new Date(expiredDate)
    db_connection.query("UPDATE orgs SET name = ?, address = ?, phone = ?, expiredDate = ? WHERE id = ?", [name, address, phone, expiry, orgId], (err, results) => {
        if (err) {
            console.log(err);
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
                address: address,
                phone: phone,
                status: 'active',
                expiredDate: expiry
            }
        })
    })  
}

exports.deleteOrg = (req, res) => {
    if (req.user.orgId !== 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "This user is from other organization not from us"
        })
    }

    const orgId = req.params.id
    db_connection.query("UPDATE orgs SET status = 'deleted' WHERE id = ?", [orgId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Organization not found',
                dev: "Organization not found"
            })
        }
        return res.status(200).send({
            success: true,
            message: 'Organization deleted successfully',
            dev: "Good Job, Bro!"
        })
    })
}