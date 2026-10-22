// require("dotenv").config();
const { Client } = require("pg");

async function main() {

const connectionString = process.argv[2];

  if (!connectionString) {
    console.error("Usage: node db/cleardb.js <database-url>");
    process.exit(1);
  }


console.log("dropping...");

  const client = new Client({ connectionString });
  await client.connect();
//   await client.query("DROP TABLE IF EXISTS parts;");
// using truncate so website doesn't crash.
  await client.query("TRUNCATE TABLE parts, brands, categories RESTART IDENTITY;");
  await client.end();
  console.log("done");
}

main();
