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
        SELECT ec.id, ec.name, u.name AS createdBy
        FROM expcats ec
        JOIN users u ON ec.createdBy = u.id
        WHERE ec.orgId = ? AND ec.status = ?
        LIMIT ? OFFSET ?
    `;

    db_connection.query(query, [orgId, status, pageSize, offset], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        const countQuery = `SELECT COUNT(*) AS total FROM expcats WHERE orgId = ?`;

        db_connection.query(countQuery, [orgId], (err, countResults) => {
            if (err) {
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

exports.getExpenseCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    
    let query = `SELECT * FROM expcats WHERE expcats.id = ${id}`;

    db_connection.query(query, (err, results) => {
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
                message: 'Data not found',
                dev: "Data not found"
            })
        }

        const orgId = results[0].orgId
        orgQuery = `SELECT name FROM orgs WHERE id = ${orgId}`;

        db_connection.query(orgQuery, (err, orgResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }
            
            if (orgResult.length === 0) {
                orgName = ""
            } else {
                orgName = orgResult[0].name
            }
            results[0].orgName = orgName
            return res.status(200).send({
                success: true,
                message: "We found the data!",
                dev: "Thanks bro, you`re awesome",
                data: results[0]
            })
        })
    });
};

exports.updateExpenseCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    if (!name) {
        return res.status(400).send({ error: 'Name is required' });
    }
    const query = `UPDATE expcats SET name = ? WHERE id = ? AND orgId = ?`;
    db_connection.query(query, [name, id, orgId], (err, results) => {
        if (err) {
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

exports.restoreExpenseCategory = (req, res) => {
    const { id } = req.params.id;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE expcats SET status = 'active' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
        if (err) {
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
            message: 'Expense Category restored successfully',
            dev: "Good Job, Bro!",
        })
    })
}
exports.createIncomeCategory = (req, res) => {
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
    const query = `INSERT INTO inccats (name, orgId, createdBy, status) VALUES (?, ?, ?, ?)`;
    db_connection.query(query, [name, orgId, createdBy, 'active'], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        res.status(200).send({
            success: true,
            message: 'Income Category created successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name,
                orgId: orgId,
                createdBy: createdBy
            }
        })
    })
}

exports.getIncomeCategory = (req, res) => {
    if (req.user.orgId === 0) {
        return res.status(403).send({
            success: false,
            message: 'You cannot access at the moment, kindly contact admin team',
            dev: "Superadmin cannot get the access to organization's data"
        })
    }
    const id = req.params.id
    let query = `SELECT * FROM inccats WHERE inccats.id = ${id}`;

    db_connection.query(query, (err, results) => {
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
                message: 'Data not found',
                dev: "Data not found"
            })
        }
        const orgId = results[0].orgId
        orgQuery = `SELECT name FROM orgs WHERE id = ${orgId}`;

        db_connection.query(orgQuery, (err, orgResult) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: 'internal server error',
                    dev: err
                })
            }
            
            if (orgResult.length === 0) {
                orgName = ""
            } else {
                orgName = orgResult[0].name
            }
            results[0].orgName = orgName
            return res.status(200).send({
                success: true,
                message: "We found the data!",
                dev: "Thanks bro, you`re awesome",
                data: results[0]
            })
        })
    });
};

exports.updateIncomeCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    if (!name) {
        return res.status(400).send({ error: 'Name is required' });
    }
    const query = `UPDATE inccats SET name = ? WHERE id = ? AND orgId = ?`;
    db_connection.query(query, [name, id, orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category updated successfully',
            dev: "Good Job, Bro!",
            data: {
                name: name
            }
        })
    })
}


exports.deleteIncomeCategory = (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE inccats SET status = 'deleted' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category deleted successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.restoreIncomeCategory = (req, res) => {
    const { id } = req.params.id;
    const orgId = req.user.orgId; // Ensure the category belongs to the user's organization

    const query = `UPDATE inccats SET status = 'active' WHERE id = ? AND orgId = ?`;

    db_connection.query(query, [id, orgId], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({
                success: false,
                message: 'Income Category not found',
                dev: "Income Category not found"
            })
        }
        res.status(200).send({
            success: true,
            message: 'Income Category restored successfully',
            dev: "Good Job, Bro!",
        })
    })
}

exports.listIncomeCategory = (req, res) => {

    const { page = 1, pageSize = 10 } = req.query;
    const orgId = req.user.orgId
    const { status = 'active' } = req.query;
    const offset = (page - 1) * pageSize;
    const query = `
        SELECT ec.id, ec.name, u.name AS createdBy
        FROM inccats ec
        JOIN users u ON ec.createdBy = u.id
        WHERE ec.orgId = ? AND ec.status = ?
        LIMIT ? OFFSET ?
    `;

    db_connection.query(query, [orgId, status, pageSize, offset], (err, results) => {
        if (err) {
            return res.status(500).send({
                success: false,
                message: 'internal server error',
                dev: err
            })
        }

        const countQuery = `SELECT COUNT(*) AS total FROM inccats WHERE orgId = ?`;

        db_connection.query(countQuery, [orgId], (err, countResults) => {
            if (err) {
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
                message: 'Income Category list',
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