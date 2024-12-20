const { query } = require('express')
const db_connection = require('../../utils/connection')

exports.createExpenseCategory = (req, res) => {
    const { name } = req.body
    const orgId = req.user.orgId
    const createdBy = req.user.id

    if (!name) {
        return res.status(400).send({
            success: false,
            message: 'name is required',
            dev: "name is required"
        })
    }
    const query = `INSERT INTO expcats (name, orgId, createdBy, status) VALUES (?, ?, ?, ?)`;

    db_connection.query(query, [name, orgId, createdBy, 'active'], (err, results) => {
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
            message: 'Expense Category created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                orgId: orgId,
                createdBy: createdBy
            }
        })
    })
}

exports.listExpenseCategory = (req, res) => {

    const { page = 1, pageSize = 10 } = req.query;
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
    const offset = (page - 1) * pageSize;
    const query = `
        SELECT ec.id, ec.name, u.name AS created_by
        FROM expcats ec
        JOIN users u ON ec.createdBy = u.id
        WHERE ec.orgId = ? AND ec.status = ?
        LIMIT ? OFFSET ?
    `;

    db_connection.query(query, [orgId, status, pageSize, offset], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        const countQuery = `SELECT COUNT(*) AS total FROM expcats WHERE orgId = ?`;

        db_connection.query(countQuery, [orgId], (err, countResults) => {
            if (err) {
                console.log(err);
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }
            const total = countResults[0].total;
            const totalPages = Math.ceil(total / pageSize);
            res.status(200).send({
                success: true,
                message: 'Expense Category list',
                dev: "Good Job, Bro!",
                data: results,
                pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    total,
                    totalPages,
                }
            })
        })
    })
}

exports.updateExpenseCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    console.log(id, name, orgId);
    if (!name) {
        return res.status(400).send({ error: 'Name is required' });
    }
    const query = `UPDATE expcats SET name = ? WHERE id = ? AND orgId = ?`;
    db_connection.query(query, [name, id, orgId], (err, results) => {
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
                message: 'Expense Category not found',
                dev: "Expense Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Expense Category updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name
            }
        })
    })
}

exports.deleteExpenseCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE expcats SET status = 'deleted' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
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
                message: 'Expense Category not found',
                dev: "Expense Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Expense Category deleted successfully',
            dev: "Good Job, Bro!",
        })
    })
}