require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const session = require('express-session');

const Auth = require('./controllers/admin/auth');
const indexRouter = require('./routes/index');
const AdminPanelRouter = require('./routes/adminPanel');
const AdminLoginRouter = require('./routes/adminLogin');

const app = express();

app.use(session({
  secret: 'asela2001',
  cookie: {
    maxAge: 1000 * 60 * 60 * 1,
    secure: false
  },
  saveUninitialized: false,
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'admin_panel/build/')));

// Admin Panel
app.use('/admin-panel', Auth, AdminPanelRouter);

// Supre Admin Login
app.use('/admin-login', AdminLoginRouter);

// All Other Request will return to Static Website
app.get('*', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'admin_panel/build/index.html'));
  });

module.exports = app;
