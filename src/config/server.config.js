const dotenv = require("dotenv");

dotenv.config();
console.log("00000000000", process.env.PRODUCTION_HOST);

module.exports = {
  PORT: process.env.PORT || 3000,
  LIVE_DB: {
    host: process.env.PRODUCTION_HOST,
    user: process.env.PRODUCTION_USERNAME,
    pass: process.env.PRODUCTION_PASSWORD,
    name: process.env.PRODUCTION_DATABASE,
    port: process.env.PRODUCTION_PORT,
  },
  REDIS: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
  },
  ADMIN: {
    ADMIN_CLIENT_SECRET: process.env.ADMIN_CLIENT_SECRET,
    ADMIN_CLIENT_ID: process.env.ADMIN_CLIENT_ID,
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY
  }
};
