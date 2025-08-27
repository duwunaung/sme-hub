const db_connection = require('../utils/connection');
require('dotenv').config()
let isSubscriberAccessEnabled = false;

function refreshAccessState() {
  db_connection.query("SELECT access FROM subaccess WHERE id = ?", [1], (err, result) => {
    if (err) {
      console.error("Error refreshing access state:", err);
      return;
    }
    
    isSubscriberAccessEnabled = result && result.length > 0 && result[0].access === 1;
    console.log(`Subscriber access state refreshed: ${isSubscriberAccessEnabled ? 'enabled' : 'disabled'}`);
  });
}

refreshAccessState();
const minuteNum = process.env.REFRESH_INTERVAL || 1
const REFRESH_INTERVAL = minuteNum * 60 * 1000;
setInterval(refreshAccessState, REFRESH_INTERVAL);

const subAccess = (req, res, next) => {
  if (isSubscriberAccessEnabled) {
    next();
  } else {
    res.render('subscriber/access-deny');
  }
};

module.exports = subAccess;