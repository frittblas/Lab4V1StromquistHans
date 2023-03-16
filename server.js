const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config()

let db = require('./database');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view-engine', 'ejs');

let currentKey = "";

// rest routes

// "/" will redirect user to /identify
app.get('/', (req, res) => {
  res.redirect("/identify");
});

app.get('/identify', (req, res) => {
  res.render(('identify.ejs'));
});

app.get('/granted', authenticateToken, (req, res) => {
  res.render(('start.ejs'));
});

app.get('/admin', async (req, res) => {
  try {
    users = await db.getAllUsers();
    console.log("getAllUsers result: ", users);
    res.render('admin.ejs', { users });
  } catch (error) {
    console.log("getAllUsers db error: ", error);
  }

});


app.post('/LOGIN', async (req, res) => {
  let result;
  console.log("LOGIN req.body = ", req.body);

  if (req.body.user_name != '' && req.body.user_password != '') {
    try {

      try {
        result = await db.getUser(req.body.user_name, req.body.user_password);
        console.log("getUser result: ", result);
      } catch (error) {
        console.log("getUser db error: ", error);
      }

      console.log("req.body.user_password = ", req.body.user_password);
      console.log("result.password = ", result.password);
      if (req.body.user_password == result.password) {

        // render the start page and log the token
        console.log("login: true");
        let token = jwt.sign(req.body.user_name, process.env.ACCESS_TOKEN_SECRET);
        console.log("token: ", token);

        // authenticate
        currentKey = token;
        res.redirect("/granted");

        return; // return function

      } else {
        console.log("login: false");
        res.render("fail.ejs");
        return;
      }

    } catch (error) {
      console.log("LOGIN error: ", error);
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