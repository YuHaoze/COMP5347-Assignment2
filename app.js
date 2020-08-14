var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var pageRouter = require('./app/routes/pageRouter');
var mongoose = require('mongoose');
const analyticsRouter = require('./app/routes/analyticsRouter');
const flash = require('connect-flash');
const favicon = require('serve-favicon');


var app = express();

app.set('views', path.join(__dirname, 'app/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookie())
// Set view engine
app.set('view engine', 'pug')

app.use(favicon(path.join('', 'public', 'favicon.ico')))
app.use(express.static(path.join('', 'public')))
app.use('/assets', [
    express.static(path.join('', 'node_modules/jquery/dist')),
    express.static(path.join('', 'node_modules/sweetalert2/dist')),
    express.static(path.join('', 'node_modules/jquery-validation/dist')),
])

mongoose.connect('mongodb://localhost/wikipedia', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, function () {
  console.log('mongodb connected')
});

app.use(session({
    name: 'wikilatic',
    secret: 'ssshhhhh',
    cookie: { maxAge: 1800000 },
    resave: true,
    saveUninitialized: true
}));

app.use(flash())

app.use('/', pageRouter);

app.use('/analytics', analyticsRouter)

app.listen(3000, function () {
    console.log('survey app is listening on port 3000!');
});
