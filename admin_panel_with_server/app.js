var express = require('express');
var path = require('path');
var cors = require('cors');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var AdminPanel = require('./routes/AdminPanel');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'admin_panel/build/')));

// Index API
app.use('/', indexRouter);

// API
app.use('/admin-panel', AdminPanel);

// All Other Request will return to index
app.get('*', function(req, res, next) {
    res.sendFile(path.join(__dirname, 'admin_panel/build/index.html'));
  });

module.exports = app;
