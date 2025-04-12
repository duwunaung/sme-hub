require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session');

//middlewares
const corsMiddleware = require('./middlewares/cors.js')
const {helmetMiddleware} = require('./middlewares/helmet.js')
const setupLoggerMiddleware = require('./middlewares/morganLog.js')
const {rateLimiterMiddleware, authRateLimiterMiddleware} = require('./middlewares/rateLimiter.js')

// routes
const utils_v01 = require('./routes/v0.1/utilsRoute')
const dashboard_v01 = require('./routes/v0.1/dashboardRoute')
const extInc_v01 = require('./routes/v0.1/extIncRoute')
const extExp_v01 = require('./routes/v0.1/extExpRoute')
const organization_v01 = require('./routes/v0.1/organizationRoute')
const extUser_v01 = require('./routes/v0.1/extUserRoute')
const user_v01 = require('./routes/v0.1/userRoute')
const extCats_v01 = require('./routes/v0.1/extCatsRoute')
const extTrans_v01 = require('./routes/v0.1/extTransRoute')
const extOrg_v01 = require('./routes/v0.1/extOrgRoute')
const extSalesperson_v01 = require('./routes/v0.1/extSalespersonRoute.js')
const extDashboard_v01 = require('./routes/v0.1/extDashboardRoute.js')

const saViews_v01 = require('./routes/v0.1/saViewsRoute')
const suViews_v01 = require('./routes/v0.1/suViewsRoute')
const homePage_v01 = require('./routes/v0.1/homePageRoute')

// middlewares
const authenticateToken = require('./middlewares/authenticateToken')
const authorizeRole = require('./middlewares/authorizeRole')
const subAccess = require('./middlewares/subaccess')


const app = express();


setupLoggerMiddleware(app);
app.use(express.static('uploads'))
app.use(corsMiddleware);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET, // Replace with a strong secret
  resave: false,
  saveUninitialized: true,
}));


const l1Access = ['superadmin']
const l2Access = ['superadmin', 'admin']
const l3Access = ['superadmin', 'admin', 'manager']
const l4Access = ['superadmin', 'admin', 'manager', 'staff']
const subscribers = ['admin', 'manager', 'staff', 'subscriber']

// view engine setup
app.use(helmetMiddleware);
app.use(rateLimiterMiddleware);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/superadmin', saViews_v01)
app.use('/subscriber', subAccess , suViews_v01)


// API 
// api middleware

app.use("/api/v0.1/utils", utils_v01);
app.use("/api/v0.1/dashboard", authenticateToken, authorizeRole(l1Access), dashboard_v01);


app.use("/api/v0.1/organizations", authenticateToken, authorizeRole(l1Access), organization_v01)
app.use("/api/v0.1/users", authenticateToken, authorizeRole(l1Access), user_v01)

app.use('/api/v0.1/subscribers', extUser_v01)

app.use('/api/v0.1/subscribers/categories', authenticateToken, authorizeRole(subscribers), extCats_v01)
app.use("/api/v0.1/subscribers/incomes", authenticateToken, authorizeRole(subscribers), extInc_v01);
app.use("/api/v0.1/subscribers/expenses", authenticateToken, authorizeRole(subscribers), extExp_v01);
app.use("/api/v0.1/subscribers/transactions", authenticateToken, authorizeRole(subscribers), extTrans_v01);
app.use("/api/v0.1/subscribers/organization", authenticateToken, authorizeRole(subscribers), extOrg_v01);
app.use("/api/v0.1/subscribers/user", authenticateToken, authorizeRole(subscribers), extUser_v01);
app.use("/api/v0.1/subscribers/salesperson", authenticateToken, authorizeRole(subscribers), extSalesperson_v01);
app.use("/api/v0.1/subscribers/dashboard", authenticateToken, authorizeRole(subscribers), extDashboard_v01);

app.use('/', homePage_v01)
app.listen(process.env.PORT, function () {
  console.log("Server is running on", process.env.PORT);
})
