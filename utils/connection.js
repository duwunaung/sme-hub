require('dotenv').config();
const mysql = require('mysql2');

// Create a pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

const db = {
    connect: (callback) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error connecting to MySQL: ', err);
                if (callback) callback(err);
                return;
            }
            connection.release();
            console.log('Connected to MySQL pool');
            if (callback) callback(null);
        });
    },
    
    query: function(sql, args, callback) {
        if (typeof args === 'function') {
            callback = args;
            args = [];
        }
        
        return pool.query(sql, args, callback);
    },
    
    promise: function() {
        return promisePool;
    },
    
    ping: function(callback) {
        return pool.query('SELECT 1', callback);
    }
};

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL pool: ', err);
        return;
    }
    console.log('Connected to MySQL pool');
    
    setInterval(() => {
        db.ping((err) => {
            if (err) {
                console.error('Error pinging MySQL: ', err);
            }
        });
    }, 3600000);
});

module.exports = db;