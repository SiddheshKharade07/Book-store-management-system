const pgp = require("pg-promise")();

const db = pgp({
  host: "localhost", // your DB host
  port: 5432, // default port
  database: "bookStore", // your DB name
  user: "postgres", // your username
  password: "#setup07", // your password
});

module.exports = db;
