require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const session = require('express-session');

const Auth = require('./controllers/admin/auth');
const indexRouter = require('./routes/index');
const adminPanelRouter = require('./routes/adminPanel');
const adminLoginRouter = require('./routes/adminLogin');
const sendMailRouter = require('./routes/sendMail');
const sendWhastappMsgRouter = require('./routes/sendWhatsappMsg');

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
app.use('/admin-panel', Auth, adminPanelRouter);

// Supre Admin Login
app.use('/admin-login', adminLoginRouter);

// Send mail messages
app.use('/mail', sendMailRouter);
app.use('/whatsapp_msg', sendWhastappMsgRouter);

// All Other Request will return to Static Website
app.get('*', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'admin_panel/build/index.html'));
  });

module.exports = app;
