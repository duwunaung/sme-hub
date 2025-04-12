const helmet = require('helmet');

const helmetMiddleware = helmet({
  contentSecurityPolicy: false,
  frameguard: { action: 'deny' },
  dnsPrefetchControl: false,
  xssFilter: true,
  noSniff: true,
  hsts: {
    maxAge: 15552000,
    includeSubDomains: true
  }
});

module.exports = { helmetMiddleware };