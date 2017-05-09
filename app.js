var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/app/public'));
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');

var config = require("./lib/config.json");
//global.word=0;

app.get('/', function (req, res) {
  var data = {};
  data = config;
  data.foo="bar";
  res.render('dashboard',data);
  console.log("dashboard loaded")
})

io.on('connection', function(socket){
  console.log('User connected');
  
  socket.on('disconnect', function(){
    console.log('User disconnected');
  });
  
  socket.on('click-test', function(){
    console.log('User clicked');
    socket.emit('news', { hello: 'world' });
  });
  
});



http.listen(config.web_port, function () {
  console.log('Example app listening on port 3000')
})