const rateLimit = require('express-rate-limit');
require('dotenv').config()

const rateLimitNum = process.env.REQUEST_LIMIT

const rateLimiterMiddleware = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: rateLimitNum || 60, // limit each IP to 90 requests per windowMs
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: 'Too many requests from this IP, please try again after 1 minute'
});

const authRateLimiterMiddleware = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 15, // 15 attempts per hour
	message: 'Too many login attempts, please try again later'
});

module.exports = {rateLimiterMiddleware, authRateLimiterMiddleware}
