const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.config');
const { ADMIN } = require('../config/server.config');
const customError = require('../utils/error.handler');
const { try_catch } = require('../utils/tryCatch.handler');


const authenticate = try_catch(
    async (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new customError('Token not provided', 401);
        }

        const decoded = jwt.verify(token, ADMIN.ADMIN_PRIVATE_KEY);
        const storedToken = await redisClient.get(`admin-${decoded.id}`);
        if (!storedToken) {
            throw new customError('You are already logged out or session expired', 403);
        }
        if (token !== storedToken) {

            throw new customError('Session expired. Please login again', 403);
        }

        req.adminId = decoded.id;
        next();
    }
);


module.exports = authenticate;