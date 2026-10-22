// require("dotenv").config();
//Steps to separate script from project.
//1. remove dotenv to prevent script fom reading from env

const { Client } = require("pg");



const SQL = `
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS parts (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  brand_id INTEGER NOT NULL REFERENCES brands(id),
  category_id INTEGER NOT NULL REFERENCES categories(id)
);

INSERT INTO brands (name, description) VALUES
  ('Shimano', 'Japanese maker of drivetrain, brake and pedal components.'),
  ('SRAM', 'American maker of drivetrain and brake components.'),
  ('Continental', 'German maker of road and gravel tyres and tubes.'),
  ('Schwalbe', 'German maker of touring and commuter tyres and tubes.');

INSERT INTO categories (name, description) VALUES
  ('Drivetrain', 'Chains, cassettes and derailleurs.'),
  ('Brakes', 'Pads, hoses and brake parts.'),
  ('Tyres & tubes', 'Tyres and inner tubes.'),
  ('Pedals', 'Flat and clipless pedals.');

INSERT INTO parts (name, price, quantity, brand_id, category_id) VALUES
  ('11-speed chain',           29.99, 12, (SELECT id FROM brands WHERE name = 'Shimano'),     (SELECT id FROM categories WHERE name = 'Drivetrain')),
  ('Cassette 11-34t',          45.00,  6, (SELECT id FROM brands WHERE name = 'Shimano'),     (SELECT id FROM categories WHERE name = 'Drivetrain')),
  ('Disc brake pads',          21.00, 15, (SELECT id FROM brands WHERE name = 'Shimano'),     (SELECT id FROM categories WHERE name = 'Brakes')),
  ('SPD clipless pedals',      54.99,  5, (SELECT id FROM brands WHERE name = 'Shimano'),     (SELECT id FROM categories WHERE name = 'Pedals')),
  ('Flat pedals',              39.99,  9, (SELECT id FROM brands WHERE name = 'Shimano'),     (SELECT id FROM categories WHERE name = 'Pedals')),

  ('Rear derailleur',          89.99,  4, (SELECT id FROM brands WHERE name = 'SRAM'),        (SELECT id FROM categories WHERE name = 'Drivetrain')),
  ('Brake pad set',            18.50,  8, (SELECT id FROM brands WHERE name = 'SRAM'),        (SELECT id FROM categories WHERE name = 'Brakes')),
  ('Hydraulic brake hose kit', 14.00, 10, (SELECT id FROM brands WHERE name = 'SRAM'),        (SELECT id FROM categories WHERE name = 'Brakes')),

  ('Grand Prix 700x25c tyre',  49.99, 10, (SELECT id FROM brands WHERE name = 'Continental'), (SELECT id FROM categories WHERE name = 'Tyres & tubes')),
  ('Inner tube 700x25c',        6.99, 30, (SELECT id FROM brands WHERE name = 'Continental'), (SELECT id FROM categories WHERE name = 'Tyres & tubes')),
  ('Inner tube 700x28c',        7.49, 25, (SELECT id FROM brands WHERE name = 'Continental'), (SELECT id FROM categories WHERE name = 'Tyres & tubes')),

  ('Marathon 700x35c tyre',    39.99,  7, (SELECT id FROM brands WHERE name = 'Schwalbe'),    (SELECT id FROM categories WHERE name = 'Tyres & tubes')),
  ('Inner tube 26 inch',        5.99, 20, (SELECT id FROM brands WHERE name = 'Schwalbe'),    (SELECT id FROM categories WHERE name = 'Tyres & tubes')),
  ('Inner tube 700x35c',        6.49, 18, (SELECT id FROM brands WHERE name = 'Schwalbe'),    (SELECT id FROM categories WHERE name = 'Tyres & tubes'));
`;

async function main() {

     const connectionString = process.argv[2];
    // 2.connection string is now from the argv array which will be a url 
    // inserted when calling the script

if (!connectionString) { 
       console.error("Usage: node db/populatedb.js <database-url>");
       process.exit(1);
}
//3. argv has the first 2 items in array filled in automatically (path to node, path to script,), 
// we create the 3 entry to tell script which database to connect to.

  console.log("seeding...");
  
const client = new Client({ connectionString });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();