require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const Auth = require('./controllers/admin/auth');
const AuthLogin = require('./controllers/admin/loginAuth');
const indexRouter = require('./routes/index');
const adminPanelRouter = require('./routes/AdminPanel');
const adminLoginRouter = require('./routes/adminLogin');
const sendMailRouter = require('./routes/sendMail');

const app = express();

app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use(session({
  store: new SQLiteStore({
    dir: './sessions',
    db: 'sessions.db',
    concurrentDB: true
  }),
  secret: 'dyGu2wc)mg%E@5$#akJ7&S',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    secure: false,
    sameSite: 'none'
  }
}));
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    try {
      sessionStore.db.exec('VACUUM;');
      console.log('SQLite maintenance: Database vacuum completed');
    } catch (err) {
      console.error('SQLite maintenance error:', err);
    }
  }, 604800000); // 7 days

  setInterval(() => {
    sessionStore.prune();
  }, 1000 * 60 * 60 * 24); // 24 hours
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'admin_panel/build/')));

app.use('/', indexRouter);
// Admin Panel
app.use('/admin-panel', Auth, adminPanelRouter);

// Supre Admin Login
app.use('/admin-login', AuthLogin, adminLoginRouter);

// Send mail messages
app.use('/mail', sendMailRouter);

app.use('/binzologo', (req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'resources/images/binzo_logo.png'));
});

app.get('/storage/pdfs/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.pdf')) return res.status(400).json({ message: "Only .pdf files can access.", error: true, from: "Main Server" });
  res.status(200).sendFile(path.join(__dirname, 'storage/PDFs/' + filename));
});

// All Other Request will return to Static Website
app.get('*', function(req, res) {
  res.status(404).sendFile(path.join(__dirname, 'admin_panel/build/index.html'));
});

module.exports = app;

