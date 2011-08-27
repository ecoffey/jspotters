require('nko')('kXMcKF9DfRvjNGzS');

var express = require('express');

var app = express.createServer();

app.listen(3000);

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
  app.set('views', __dirname);
});

app.get('/', function(req, res) {
  res.end("Oh hai");
});

