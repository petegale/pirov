var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;
var piblaster = require("pi-blaster.js"); // Import package
//var PiServo = require('pi-servo');
var proc;
var fs = require('fs');
var config = require("./lib/config.json");


//bit of a test

var piblaster = require('pi-blaster.js');
piblaster.setPwm(23, 0.2 ); // 20% brightness

//var svUp = new PiServo(config.svUp); 
//svUp.setDegree(100); //100 degrees

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
  //svUp.open().then(function(){  
    //svUp.setDegree(mixer.VOut); // 0 - 180
      console.log(mixer.VOut);
  //});
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
  //global.host = global.host.substr(0,global.host.indexOf(":"));
  console.log("dashboard loaded")
})

//SOCKET.IO CONNECTIONS

io.on('connection', function(socket){
  global.url=socket.handshake.headers.referer;
  global.url = global.url.substring(0, global.url.length - 1);
  console.log("Dashboard connected to: "+global.url);
  
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
    io.sockets.emit("liveStream",global.url+":8080/?action=stream");
  } else {
    //var s_path=__dirname+"/app/mjpg-streamer/";
    var s_path="/app/mjpg-streamer/";
    var streamCmd=s_path+"mjpg_streamer -o \""+s_path+"output_http.so -w ./www --port 8080\" -i \""+s_path+"input_raspicam.so -x "+data.width+" -y "+data.height+" -fps "+config.stream_fps+"\""; 
    proc = exec(streamCmd, function(err, stdout, stderr) {
            if (err) throw err;
        });
    global.streaming=true;
    global.sPid=proc.pid;
    console.log("PID="+global.sPid);
    console.log(streamCmd);
    //emit confirmation to dashboard
    io.sockets.emit("liveStream",global.url+":8080/?action=stream");
  }
 
}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}

http.listen(config.web_port, function () {
  console.log('Listening on port: '+config.web_port)
})