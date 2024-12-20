require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require("cors");

// routes
const utils_v01 = require('./routes/v0.1/utilsRoute')
const dashboard_v01 = require('./routes/v0.1/dashboardRoute')
const incomes_v01 = require('./routes/v0.1/incomesRoute')
const expenses_v01 = require('./routes/v0.1/expensesRoute')
const organization_v01 = require('./routes/v0.1/organizationRoute')
const user_v01 = require('./routes/v0.1/userRoute')

// middlewares
const authenticateToken = require('./middlewares/authenticateToken')
const authorizeRole = require('./middlewares/authorizeRole')

const app = express();
app.use(cors());

app.use(bodyParser.json())

const l1Access = ['superadmin']
const l2Access = ['superadmin', 'admin']
const l3Access = ['superadmin', 'admin', 'manager']
const l4Access = ['superadmin', 'admin', 'manager', 'staff']

app.use("/api/v0.1/utils", utils_v01);
app.use("/api/v0.1/dashboard", authenticateToken, authorizeRole(l1Access), dashboard_v01);
app.use("/api/v0.1/incomes", incomes_v01);
app.use("/api/v0.1/expenses", expenses_v01);

app.use("/api/v0.1/organizations", authenticateToken, authorizeRole(l1Access), organization_v01)
app.use("/api/v0.1/users", authenticateToken, authorizeRole(l1Access), user_v01)

app.listen (process.env.PORT, function() {
  console.log("Server is running on", process.env.PORT);
})
