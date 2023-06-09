const sqlite3 = require("sqlite3").verbose();
let db;

exports.connect = function connectDB() {

  db = new sqlite3.Database("./users.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
  });

  console.log("Connected to DB!");

}

exports.close = function closeDB() {

  db.close();

}

exports.createTableUsers = function createTable() {

  sql = `CREATE TABLE users(userID PRIMARY KEY, name, role, password)`;
  db.run(sql);

  console.log("Created table in DB!");

}

exports.dropTableUsers = function dropDB() {

  db.run("DROP TABLE users");

  console.log("Dropped table users!");

}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

exports.insertUsers = async function insertUsersDB() {

  sql = `INSERT INTO users(userID, name, role, password)VALUES (?, ?, ?, ?)`;

  db.run(sql, ["id1", "user1", "student", "password"], (err) => {
    if (err) return console.error(err.message);
  });

  // slight delay to ensure order
  await sleep(100);

  db.run(sql, ["id2", "user2", "student", "password2"], (err) => {
    if (err) return console.error(err.message);
  });

  await sleep(100);

  db.run(sql, ["id3", "user3", "student", "password3"], (err) => {
    if (err) return console.error(err.message);
  });

  await sleep(100);

  db.run(sql, ["admin", "admin", "admin", "admin"], (err) => {
    if (err) return console.error(err.message);
  });

  console.log("Inserted users to DB!");

}

exports.getUser = (name, password) => {

  return new Promise((resolve, reject) => {

    sql = `SELECT * FROM users WHERE name = ? AND password = ?`;

    db.get(sql, [name, password], (err, row) => {

      if (err)
        reject(err);
      else
        resolve(row);

    });

  });
}

exports.getAllUsers = () => {

  return new Promise((resolve, reject) => {

    sql = `SELECT * FROM users`;

    db.all(sql, [], (err, rows) => {

      if (err)
        reject(err);
      else {

        let result = [];

        rows.forEach((row) => {

          result.push(row);

        });

        resolve(result);

      }


    });

  });

}