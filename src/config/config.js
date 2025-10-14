const serverConfig = require("./server.config");
const dotenv = require("dotenv")
// console.log(process.env,"sdff")
module.exports = {
development: {
  username: "postgres",
  password: "12345",
  database: "zeniushub_dev",
  host: "127.0.0.1",
  dialect: "postgres"
},
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  // production: {
  //   "username": serverConfig.LIVE_DB.user,
  //   "password": serverConfig.LIVE_DB.pass,
  //   "database": serverConfig.LIVE_DB.name,
  //   "host": serverConfig.LIVE_DB.host,
  //   "port":serverConfig.LIVE_DB.port,
  //   "dialect": "postgres",
  //   "pool": {
  //     max: 20,     // try increasing
  //     min: 0,
  //     acquire: 30000,  // wait time before timeout
  //     idle: 10000
  //   }
  // },
};

