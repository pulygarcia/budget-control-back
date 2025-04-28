import { rateLimit } from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production';

export const limiter = rateLimit({
	windowMs: isProduction ? 60 * 1000 : 10 * 1000, // 1 min in prod, 10 sec in others enviorments
	limit: isProduction ? 5 : 50, // 5 requests in prod, 50 in dev/test
    message:{error: 'You have reached the limit of requests'}
})