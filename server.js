const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config()

let db = require('./database');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

var dbEncryption;

app.set('view-engine', 'ejs');

// rest routes

// "/" will redirect user to Login
app.get('/', (req, res) => {
  res.redirect("/LOGIN");
})

// actual login route
app.get('/LOGIN', (req, res) => {
  res.render('login.ejs');
})

// register route
app.get('/REGISTER', (req, res) => {
  res.render('register.ejs')
})

app.post('/REGISTER', async (req, res) => {

  console.log("REGISTER req.body = ", req.body);

  if (req.body.user_name != '' && req.body.user_password != '') {
    try {
      console.log("REGISTER req.body.user_name = ", req.body.user_name);
      console.log("REGISTER req.body.user_password = ", req.body.user_password);
      dbEncryption = await bcrypt.hash(req.body.user_password, 10);
      console.log("encrypted pw: ", dbEncryption);

      try {
        let result = await db.addUser({ name: req.body.user_name, password: dbEncryption });
        console.log("db result (addUser):", result);
      } catch (error) {
        console.log("db error (addUser): ", error);
      }

    } catch {
      console.log(" REGISTER encrypt error");
    }

    req.method = 'GET';
    res.redirect("/LOGIN");

  }


})

app.post('/LOGIN', async (req, res) => {
  let result;
  console.log("LOGIN req.body = ", req.body);

  if (req.body.user_name != '' && req.body.user_password != '') {
    try {

      try {
        result = await db.getUserByName(req.body.user_name);
        console.log("getUserByName result: ", result);
      } catch (error) {
        console.log("getUserByName db error: ", error);
      }

      console.log("result.length = ", result.length);
      try {
        console.log("req.body.user_password = ", req.body.user_password);
        console.log("result[0]password = ", result[0].password);
        if (await bcrypt.compare(req.body.user_password, result[0].password)) {

          // render the start page and log the token
          console.log("login: true");
          res.render("start.ejs");
          var token = jwt.sign(req.body.user_name, process.env.TOKEN);
          console.log("token: ", token);
          return; // return function

        } else {
          console.log("login: false");
          res.render("fail.ejs");
          return;
        }
      } catch (error) {
        console.log("compare password error: ", error);
      }

    } catch (error) {
      console.log("LOGIN encrypt error: ", error);
    }

    req.method = 'GET';
    res.redirect("/");

  }

})

app.listen(5000);
db.connect();
//db.createTableUsers();
//db.insertUsers();
//db.dropTableUsers();