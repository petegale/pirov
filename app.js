var express = require('express')
var app = express()

app.use(express.static(__dirname + './app/public'));
app.set('views', __dirname + './app/views');
app.set('view engine', 'ejs');

var config = require("./lib/config.json");
//global.word=0;

app.get('/', function (req, res) {
  var data = {};
  data = config;
  data.foo="bar";
  response.render('dashboard',data);
})

app.listen(config.web_port, function () {
  console.log('Example app listening on port 3000')
})