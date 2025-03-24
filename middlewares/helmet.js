const helmet = require('helmet');

const helmetMiddleware = helmet({
	frameguard: { action: 'deny' },
	contentSecurityPolicy: {
	  directives: {
		defaultSrc: ["'self'"],
		styleSrc: ["'self'"],
		imgSrc: ["'self'"],
		scriptSrc: ["'self'"],
		connectSrc: ["'self'", "http://localhost:3000/subscriber", "http://localhost:3000/superadmin"],
		upgradeInsecureRequests: [],
	  }
	},
	dnsPrefetchControl: false, // may compromise the speed and performance
	xssFilter: true,
	noSniff: true,
	hsts: {
	  maxAge: 15552000,
	  includeSubDomains: true // force to use https 
	}
});

const helmetUIMiddleware = helmet({
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "https://kit.fontawesome.com/61980c2b15.js", 
                "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js", 
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
            ],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
                "https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css",
				"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
            ],
            fontSrc: ["'self'", "https://kit.fontawesome.com"],
            connectSrc: [
                "'self'",
                "https://localhost:3000/subscriber",
                "https://localhost:3000/superadmin"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    dnsPrefetchControl: false, // may compromise speed and performance
    xssFilter: true,
    noSniff: true,
    hsts: {
        maxAge: 15552000,
        includeSubDomains: true, // force to use https 
    },
    referrerPolicy: { policy: "no-referrer-when-downgrade" },
	hidePoweredBy: true,
});

module.exports = {helmetUIMiddleware, helmetMiddleware};
