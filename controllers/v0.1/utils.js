const db_connection = require('../../utils/connection')

const bcrypt = require('bcryptjs')

const calculatedExpiryDate = () => {
  const now = new Date()
  now.setDate(now.getDate() + 30)
  return now
}

exports.register = async (req, res) => {

    const { name, email, phone, password, remark, orgId, role } = req.body

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const expiredDate = calculatedExpiryDate()

        db_connection.query(
            'INSERT INTO users (name, email, phone, password, registered, status, expired, remark, orgId, role) VALUES (?,?,?,?,?,?,?,?,?,?)',
            [name, email, phone, hashedPassword, new Date(), 'active', expiredDate, remark, orgId, role],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(500).send({
                        success: false,
                        message: 'internal server error',
                        dev: "Error while registering new user"
                    })
                } else {
                    res.status(201).send({
                        success: true,
                        dev: 'No Issue, Thanks',
                        message: 'Successfully Registered',
                        data: {
                            username: name,
                            email: email,
                            phone: phone,
                            role: role,
                            expiredDate: expiredDate
                        }
                    })
                }
            })
    } catch (err) {
        console.log(err);

        res.status(500).send({
            success: false,
            message: 'internal server error',
            dev: err
        })
    }
}