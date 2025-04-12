const db_connection = require('../utils/connection')

const subAccess = (req, res, next) => {
  db_connection.query("SELECT access FROM subaccess WHERE id = ?", [1], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.render('subscriber/access-deny');
    }
    if (result && result.length > 0 && result[0].access) {
      next();
    } else {
      res.render('subscriber/access-deny');
    }
  });
}

module.exports = subAccess