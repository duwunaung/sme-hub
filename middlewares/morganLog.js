const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const setupLoggerMiddleware = (app) => {
	// Create a logs directory if it doesn't exist
	const logDirectory = path.join(__dirname, '..', 'logs');
	fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
	
	// Create a write stream for access logs
	const accessLogStream = fs.createWriteStream(
	  path.join(logDirectory, 'access.log'),
	  { flags: 'a' }
	);
	
	// Create a write stream for audit logs
	const auditLogStream = fs.createWriteStream(
	  path.join(logDirectory, 'audit.log'),
	  { flags: 'a' }
	);
  
	// Create custom token for user information
	morgan.token('user-info', function (req, res) {
	  if (req.user) {
		if (req.user.userId)
			return `Id:${req.user.userId}|Email:${req.user.email}|OrgId:${req.user.orgId}`;
		return `Id:${req.user.id}|Name:${req.user.name}|Email:${req.user.email}|OrgId:${req.user.orgId}`;
	  }
	  return 'unauthenticated';
	});
  
	// Create custom token for operation details
	morgan.token('operation', function (req, res) {
	  const method = req.method;
	  const path = req.path;
	  
	  let operation = 'UNKNOWN';
	  if (method === 'POST') operation = 'CREATE';
	  if (method === 'GET') operation = 'READ';
	  if (method === 'PUT' || method === 'PATCH') operation = 'UPDATE';
	  if (method === 'DELETE') operation = 'DELETE';
	  
	  return operation;
	});
  
	// Add standard access logging
	app.use(morgan('combined', { stream: accessLogStream }));
  
	// Add detailed audit logging for CRUD operations
	app.use(morgan('[AUDIT] :date[iso] - User::user-info - :operation - :method :url - Status::status', { 
	  stream: auditLogStream,
	  // Skip static resources and non-API routes
	  skip: function (req, res) {
		return req.path.startsWith('/static') || 
			   req.path === '/favicon.ico' ||
			   req.path.startsWith('/public');
	  }
	}));
  
	// Add console logging in development
	if (process.env.NODE_ENV !== 'production') {
	  app.use(morgan('dev'));
	}
};

module.exports = setupLoggerMiddleware;