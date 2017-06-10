var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var exec = require('child_process').exec;
var proc;
var fs = require('fs');
var config = require("./lib/config.json");
var servoMin=500;
var servoMax=2500;
var isPi = require('detect-rpi');
var www_port=config.dev_port;
var lightStatus=false;
var serverStatus="dev";

if (isPi()) {
  www_port = config.prod_port;
  var Gpio = require('pigpio').Gpio;
  var svUp = new Gpio(config.svUp, {mode: Gpio.OUTPUT});
  var svLED = new Gpio(config.svLED, {mode: Gpio.OUTPUT});
  var svLeft = new Gpio(config.svL, {mode: Gpio.OUTPUT});
  var svRight = new Gpio(config.svR, {mode: Gpio.OUTPUT});
  console.log("Servo control is LIVE");
  serverStatus = "live";
} else {
  console.log("Servo control is SIMULATED");
}

function safeServoWrite(gpio,val) {
  //safely handle servo values from -50 to +50
  var logOut = "in ="+val;
  val=val+50;
  if (val>100) {
    val=100;
  }
  val=(val*((servoMax-servoMin)/100))+servoMin;
  if (serverStatus == "live") {
    console.log(logOut+"Live out "+val);
    gpio.servoWrite(val);
  } else {
    console.log(logOut+"Sim out "+val);
  }
}

var mixer = {};
mixer.xIn=0;
mixer.yIn=0;
mixer.tIn=0;

mixer.VOut=0;
mixer.LOut=0;
mixer.ROut=0;

mixer.mix = function() {
  //up and down are independent so just pass through
  mixer.VOut=mixer.yIn;
  //tIn = thrust, so pass this to both left and right
  mixer.ROut = mixer.tIn;
  mixer.LOut = mixer.tIn;

  //now modify this for cases of rotation via xIn
  if (mixer.tIn>0) {
    //going forward
    mixer.LOut=mixer.LOut+mixer.xIn;
    mixer.ROut=mixer.ROut-mixer.xIn;
  } else {
    //probably need to handle backwards differently 
  }
  
  //send mixed signal to motors
  console.log("send up");
  safeServoWrite(svUp,mixer.VOut);
  console.log("send Left");
  safeServoWrite(svLeft,mixer.LOut);
  console.log("send right");
  safeServoWrite(svRight,mixer.ROut);
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
  socket.on('l', function(x) {
    if (lightStatus=="on") {
      //Lights are already on, turn off
      lightStatus = "off";
      safeServoWrite(svLED,0);
    } else {
      //Lights are off so turn them on
      lightStatus =  "on";
      safeServoWrite(svLED,50);
    }
    console.log("lights: "+lightStatus);
    //emit confirmation to dashboard
    io.sockets.emit("lightStatus",lightStatus);
    
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
    var s_path="/home/pi/mjpg-streamer/";
    var streamCmd=s_path+"mjpg_streamer -o \""+s_path+"output_http.so -w ./www --port 8080\" -i \""+s_path+"input_raspicam.so -rot "+config.img_rotation+" -x "+data.width+" -y "+data.height+" -fps "+config.stream_fps+"\""; 
    if (isPi()) {
      proc = exec(streamCmd, function(err, stdout, stderr) {
        if (err) throw err;
      });
      global.sPid=proc.pid;
      console.log("PID="+global.sPid);
    }
    global.streaming=true;
    
    console.log(streamCmd);
    //emit confirmation to dashboard
    io.sockets.emit("liveStream",global.url+":8080/?action=stream");
  }
 
}

function getPosition(string, subString, index) {
   return string.split(subString, index).join(subString).length;
}

http.listen(www_port, function () {
  console.log('Listening on port: '+ www_port)
})