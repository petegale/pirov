var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var proc;
var fs = require('fs');
var config = require("./lib/config.json");

app.use(express.static(__dirname + '/app/public'));
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');


//WEB SERVER HANDLING SERVING THE DASHBOARD
app.get('/', function (req, res) {
  var data = {};
  data = config;
  data.foo="bar";
  res.render('dashboard',data);
  console.log("dashboard loaded")
})

//SOCKET.IO CONNECTIONS

io.on('connection', function(socket){
  console.log("Dashboard connected");
  
  socket.on('disconnect', function(){
    console.log("Dashboard connected")
    stopStreaming();
  });
  
  socket.on('start-stream', function(data) {
    startStreaming(io,data);
  });
  socket.on('stop-stream', function() {
    stopStreaming();
  });
});

//STREAM CONTROL FUNCTIONS

function stopStreaming() {
  app.set('watchingFile', false);
  if (proc) proc.kill();
  fs.unwatchFile('./stream/image_stream.jpg');
  console.log("Stop stream")
}
 
function startStreaming(io,data) {
  console.log("start stream "+data.height+"x"+data.width)
 
  if (app.get('watchingFile')) {
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
    return;
  }
 
  var args = ["-w", data.width, "-h", data.height, "-o", config.stream_file, "-t", "999999999", "-tl", 1000/config.stream_fps ];
  //console.log (args);
  proc = spawn('raspistill', args);
  console.log('Watching for changes...');
  app.set('watchingFile', true);
  fs.watchFile(config.stream_file, function(current, previous) {
    //think we're throwing an error as file doesn't exist
    io.sockets.emit('liveStream', 'image_stream.jpg?_t=' + (Math.random() * 100000));
  })
 
}


http.listen(config.web_port, function () {
  console.log('Example app listening on port 3000')
})