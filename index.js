require('dotenv').config()

const express = require('express')
const mysql = require('mysql2')

const utils_v01 = require('./routes/v0.1/utils')
const dashboard_v01 = require('./routes/v0.1/dashboard')
const incomes_v01 = require('./routes/v0.1/incomes')
const expenses_v01 = require('./routes/v0.1/expenses')

const app = express();

const db  = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
})

db.connect((err) => {
  if(err) {
    console.error('Error connecting to MySQL: ', err)
    return
  }
  console.log('Connected to MySQL')

})

app.use("/api/v0.1/utils",utils_v01);
app.use("/api/v0.1/dashboard",dashboard_v01);
app.use("/api/v0.1/incomes",incomes_v01);
app.use("/api/v0.1/expenses",expenses_v01);

app.post("/", function(req, res){
  console.log("Get Request");
  res.send({
    name: "HanZar",
    position: "Programmar"
  });
})

app.listen (process.env.PORT, function() {
  console.log("Running on 3000");
})
