var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;
var PiServo = require('pi-servo');
var proc;
var fs = require('fs');
var config = require("./lib/config.json");


var svUp = new PiServo(18); 

var mixer = {};
mixer.xIn=0;
mixer.yIn=0;
mixer.tIn=0;

mixer.VOut=0;
mixer.LOut=0;
mixer.ROut=0;

mixer.mix = function() {
  //just testing set thrust to Vout
  mixer.VOut=Math.round((mixer.tIn+50)*1.8);
  svUp.open().then(function(){  
    svUp.setDegree(mixer.VOut); // 0 - 180
      console.log(mixer.VOut);
  });
}


app.use(express.static(__dirname + '/app/public'));
app.set('views', __dirname + '/app/views');
app.set('view engine', 'ejs');
global.streaming = false;
global.host="";

//WEB SERVER HANDLING SERVING THE DASHBOARD
app.get('/', function (req, res) {
  var data = {};
  data = config;
  data.foo="bar";
  res.render('dashboard',data);
  //global.host=req.get('host');
  global.host = global.host.substr(0,global.host.indexOf(":"));
  console.log("dashboard loaded")
})

//SOCKET.IO CONNECTIONS

io.on('connection', function(socket){
  global.url=socket.handshake.headers.referer;
  global.host=global.url.substring(7)
  global.host=global.host.substring(0,global.host.indexOf(":"));
  console.log("Dashboard connected to: "+global.host);
  
  socket.on('disconnect', function(){
    console.log("Dashboard disconnected")
  });
  
  socket.on('start-stream', function(data) {
    startStreaming(io,data);
  });
  socket.on('t', function(x) {
    mixer.tIn=x;
    mixer.mix();
  });
  
  socket.on('v', function(x) {
    mixer.yIn=x;
    mixer.mix();
  });
  
  socket.on('r', function(x) {
    mixer.xIn=x;
    mixer.mix();
  });
});

//STREAM CONTROL FUNCTIONS

function stopStreaming() {

}
 
function startStreaming(io,data) {
  console.log("start stream "+data.height+"x"+data.width)
  if (global.streaming) {
    //emit confirmation to dashboard
    io.sockets.emit("liveStream","http://"+global.host+":8080/?action=stream");
  } else {
    var s_path=__dirname+"/lib/streamer/";
    var streamCmd=s_path+"mjpg_streamer -o \""+s_path+"output_http.so -w ./www\" -i \""+s_path+"input_raspicam.so -x "+data.width+" -y "+data.height+" -fps "+config.stream_fps+"\""; 
    proc = exec(streamCmd, function(err, stdout, stderr) {
            if (err) throw err;
        });
    global.streaming=true;
    global.sPid=proc.pid;
    console.log("PID="+global.sPid);
    //emit confirmation to dashboard
    io.sockets.emit("liveStream","http://"+global.host+":8080/?action=stream");
  }
 
}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}

http.listen(config.web_port, function () {
  console.log('Listening on port 3000')
})