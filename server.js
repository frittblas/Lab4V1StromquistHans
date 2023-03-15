const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config()

let db = require('./database');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view-engine', 'ejs');

let currentKey = "";
let currentPassword = "";

// rest routes

// "/" will redirect user to Login
app.get('/', (req, res) => {
  res.redirect("/identify");
});

app.post('/identify', (req, res) => {
  // authenticate
  const username = req.body.password;
  const token = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET);
  currentKey = token;
  currentPassword = username;
  res.redirect("/granted");
});

app.get('/identify', (req, res) => {
  res.render(('identify.ejs'));
});

app.get('/granted', authenticateToken, (req, res) => {
  res.render(('start.ejs'));
});

app.get('/admin', (req, res) => {
  res.render('admin.ejs');
});

// old login route
app.get('/LOGIN', (req, res) => {
  res.render('login.ejs');
});

// register route
app.get('/REGISTER', (req, res) => {
  res.render('register.ejs')
});

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
          var token = jwt.sign(req.body.user_name, process.env.ACCESS_TOKEN_SECRET);
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

});

function authenticateToken(req, res, next) {
  console.log("We are in the authentication control function.");
  if (currentKey == "") {
    res.redirect("/identify");
  } else if (jwt.verify(currentKey, process.env.ACCESS_TOKEN_SECRET)) {
    next();
  } else {
    res.redirect("/identify");
  }
}

app.listen(5000);
db.connect();
//db.createTableUsers();
//db.insertUsers();
//db.dropTableUsers();