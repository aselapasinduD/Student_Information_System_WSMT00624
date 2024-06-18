const express = require('express');
const path = require('path');

const router = express.Router();

const AuthLogin = require("./middleware/AuthLogin");

// Static Webpage for Admin-login 
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, "../admin_panel/build", "index.html"));
});


// APIs
router.post('/login', async (req, res) => {
  const {username, password} = req.body;

  if(!username && !password){
    res.status(401).json({
      message: "Username and Password are Required.",
      request: false
    });
    return
  }

  const isAuthenticate = await AuthLogin(username, password);
  if(!isAuthenticate){
    res.status(401).json({
      message: "Username or Password Is Wrong.",
      request: false
    });
    return
  }

  console.log("Login Success.");
  req.session.authenticated = true;
  res.status(200).redirect('/admin-panel');
  return
});

module.exports = router;