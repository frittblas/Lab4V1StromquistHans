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

exports.getUser = async function getUserDB(name, password) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users WHERE name=$name AND password=$password`, { $name: name, $password: password }, getCallback(reject, resolve));
  })
}

exports.getUserByName = async function getUserByName(name) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users WHERE name=$name`, { $name: name }, getCallback(reject, resolve));
  })
}

//  I know this is bad practice to have 2 functions that does the same thing
//  but for some reason I couldn't call the exported function from within this file
//  won't do this in the future :)
async function getUserByNameDB(name) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM users WHERE name=$name`, { $name: name }, getCallback(reject, resolve));
  })
}

exports.addUser = async function addUserDB(user) {

  let matchingUsers = await getUserByNameDB(user.name);
  if (matchingUsers.length > 0) {
    return new Promise((resolve, reject) => {
      reject('User already exists!');
    })
  }

  /*
  const sql = `INSERT INTO users (name, password) VALUES ($name, $password)`;
  const params = { $name: user.name, $password: user.password };

  return new Promise((resolve, reject) => {
    db.run(sql, params, getCallback(reject, resolve));
  })
*/
  const sql = `INSERT INTO users (name, password) VALUES (?, ?)`;

  return new Promise((resolve, reject) => {
    db.run(sql, [user.name, user.password], (err) => {
      if (err)
        reject(err);
      else
        resolve("Added User.");
    });
  });

}

// Extracting the callback function from the database functions, allows us to reuse code.
function getCallback(reject, resolve) {
  return (error, rows = null) => {
    if (error) {
      reject(error)  // failed, no data
    } else {
      resolve(rows)  // success
    }
  }
}
