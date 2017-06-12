var socket = io();
var control = {x:0, y:0, z:0,};
var control_increment = 10;

function inrange(x) {
  if (x > -51 && x > 51) {
    return true;
  }
}

function start_stream() {
  var sW = document.getElementById("streamcontainer").offsetWidth
  var sH = document.getElementById("streamcontainer").offsetHeight
  socket.emit('start-stream', { width : sW, height : sH });
}

function key(x) {
  var command="";
  var value=0;
  switch(x) {
      case "up":
        if (inrange(control.x)) {
          control.x += control_increment;
          console.log("increment x");
        }
        command="v";
        value=control.x;
        break;
      case "down":
        if (inrange(control.x)) {
          control.x -= control_increment;
        }
        command="v";
        value=control.x;
        break;
      case "left":
        if (inrange(control.y)) {
          control.y -= control_increment;
        }
        command="r";
        value=control.y;
        break;
      case "right":
        if (inrange(control.y)) {
          control.y += control_increment;
        }
        command="r";
        value=control.y;
        break;
      case "fast":
        if (inrange(control.z)) {
          control.z += control_increment;
        }
        command="t";
        value=control.z;
        break;
      case "slow":
        if (inrange(control.z)) {
          control.z -= control_increment;
        }
        command="t";
        value=control.z;
        break;
      case "video":
        start_stream();
        break;
      case "lights":
        sendCommand('lights','toggle'); 
        break;
      case "logging":
        sendCommand('log','toggle'); 
        break;
  }
  if  (command!="") {
    sendCommand(command,value);
  }
}

socket.on('lightStatus', function(data) {
  if (data=="on") {
    document.getElementById("lights").className = "button_on";
  } else {
    document.getElementById("lights").className = "button_off";
  }
  
});

socket.on('news', function (data) {
	alert (data.width+"x"+data.height)
});

socket.on('log', function (data) {
  if (data=="on") {
    //logging has been turned on
    document.getElementById("logging").className = "button_on";
    document.getElementById("control_data").style.display="block";
  } else {
    document.getElementById("logging").className = "button_off";
    document.getElementById("control_data").style.display="none";
  }
});


socket.on('liveStream', function(Stream_url) {
  document.getElementById("StartStreamButton").className = "button_on";
  var stream = document.getElementById('stream');
  setTimeout(function(){ stream.src=Stream_url; }, 1000);
});

function sendCommand(c,x) {
  if (c=="t") {
    document.getElementById("thrust_out").innerHTML = "Thrust: "+x;
  }
  if (c=="v") {
    document.getElementById("vert_out").innerHTML = "Vertical: "+x;
  }
  if (c=="r") {
    document.getElementById("rotate_out").innerHTML = "Rotate: "+x;
  }
  socket.emit(c,x);
  
}

window.addEventListener("load", function(){
  var StartStreamButton = document.getElementById('StartStreamButton');
  var StopButton = document.getElementById('StopButton');
  var LightButton = document.getElementById('lights');
  var LogButton = document.getElementById('logging');
  StopButton.addEventListener('click', function() {
    x=50;
    document.getElementById('thrust').value=x;
    x=x-50;
    sendCommand('t',x); 
  });
  LightButton.addEventListener('click', function() {
    sendCommand('lights','toggle'); 
  });
  LogButton.addEventListener('click', function() {
    sendCommand('log','toggle'); 
  });
  
  StartStreamButton.addEventListener('click', function() {
    start_stream();
  });
  var joystickView = new JoystickView(150, function(callbackView){
      $("#joystickContent").append(callbackView.render().el);
      setTimeout(function(){
          callbackView.renderSprite();
      }, 0);
  });
  joystickView.bind("verticalMove", function(y){
      $("#yVal").html(y);
      //Call Socket.io function to emit vertical move y
      sendCommand("v",Math.round(y*50));
  });
  joystickView.bind("horizontalMove", function(x){
      $("#xVal").html(x);
      //Call Socket.io function to emit horizontal move x
      sendCommand("r",Math.round(x*50));
  });
  
  
});
