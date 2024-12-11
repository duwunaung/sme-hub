require('dotenv').config()

const express = require('express')
const mysql = require('mysql2')
const bodyParser = require('body-parser')
const utils_v01 = require('./routes/v0.1/utils')
const dashboard_v01 = require('./routes/v0.1/dashboard')
const incomes_v01 = require('./routes/v0.1/incomes')
const expenses_v01 = require('./routes/v0.1/expenses')

const app = express();

app.use(bodyParser.json())

app.use("/api/v0.1/utils",utils_v01);
app.use("/api/v0.1/dashboard",dashboard_v01);
app.use("/api/v0.1/incomes",incomes_v01);
app.use("/api/v0.1/expenses",expenses_v01);

app.listen (process.env.PORT, function() {
  console.log("Server is running on", process.env.PORT);
})
