require("dotenv").config();
const { Pool } = require("pg");

// All of the following properties should be read from environment variables
// module.exports = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// using Connection URI

module.exports = new Pool({connectionString: process.env.DATABASE_URL});
