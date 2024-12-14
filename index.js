require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const utils_v01 = require('./routes/v0.1/utils')
const dashboard_v01 = require('./routes/v0.1/dashboard')
const incomes_v01 = require('./routes/v0.1/incomes')
const expenses_v01 = require('./routes/v0.1/expenses')

const authenticateToken = require('./middlewares/authenticateToken')
const authorizeRole = require('./middlewares/authorizeRole')


const app = express();

app.use(bodyParser.json())
const l1Access = ['superadmin']
const l2Access = ['superadmin', 'admin']
const l3Access = ['superadmin', 'admin', 'manager']
const l4Access = ['superadmin', 'admin', 'manager', 'staff']

app.use("/api/v0.1/utils", utils_v01);
app.use("/api/v0.1/dashboard", authenticateToken, authorizeRole(l2Access), dashboard_v01);
app.use("/api/v0.1/incomes", incomes_v01);
app.use("/api/v0.1/expenses", expenses_v01);

app.listen (process.env.PORT, function() {
  console.log("Server is running on", process.env.PORT);
})
