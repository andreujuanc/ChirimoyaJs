var express = require('express');
var path = require('path');
var app = express();

app.use('/chirimoya.js',express.static('dist/chirimoya.js'));
app.use('/require.js',express.static('node_modules/requirejs/require.js'));
app.use('/signals.js',express.static('node_modules/signals/dist/signals.js'));
app.use('/hasher.js',express.static('node_modules/hasher/dist/js/hasher.js'));
app.use('/crossroads.js',express.static('node_modules/crossroads/dist/crossroads.js'));
app.use('/', express.static(__dirname));

app.listen(3500, function () {
  console.log('Listening on port 3500!');
});

var open = require('open');

open('http://localhost:3500', 'chrome');