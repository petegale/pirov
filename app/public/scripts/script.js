var socket = io();
var control = {x:0, y:0, z:0,};

function start_stream() {
  var sW = document.getElementById("streamcontainer").offsetWidth
  var sH = document.getElementById("streamcontainer").offsetHeight
  socket.emit('start-stream', { width : sW, height : sH });
}

//setup for canvas horizon
function draw(x,y,z) {
  var canvas1 = document.getElementById('control1');
  var canvas2 = document.getElementById('control2');
  if (canvas1.getContext) {
    var ctx1 = canvas1.getContext('2d');
  }
  if (canvas2.getContext) {
    var ctx2 = canvas2.getContext('2d');
  }
  ctx1.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx1.fillStyle = 'rgba(0, 0, 200, 0.5)';
  ctx1.clearRect(0, 0, 200, 200); // clear canvas
  
  ctx1.beginPath();
  ctx1.moveTo(0, 0);
  ctx1.lineTo(200,0);
  ctx1.lineTo(200,200);
  ctx1.lineTo(0,200);
  ctx1.lineTo(0,0);
  ctx1.moveTo(100,0);
  ctx1.lineTo(100,200);
  ctx1.moveTo(0,100);
  ctx1.lineTo(200,100);
  ctx1.stroke();
  
  ctx1.fillRect((x*2)+85,(y*-2)+85, 30, 30);
  
  
  ctx2.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx2.fillStyle = 'rgba(0, 0, 200, 0.5)';
  ctx2.clearRect(0, 0, 20, 200); // clear canvas
  
  ctx2.beginPath();
  ctx2.moveTo(0, 0);
  ctx2.lineTo(20,0);
  ctx2.lineTo(20,200);
  ctx2.lineTo(0,200);
  ctx2.lineTo(0,0);
  ctx2.moveTo(0,100);
  ctx2.lineTo(200,100);
  ctx2.stroke();
  
  ctx2.fillRect(0,(z*-2)+90, 20, 20);
  
  
  
}


function limit(x) {
  switch(true) {
  case (x < -50):
    return -50;
    break;
  case (x > 50):
    return 50;
    break;
  default:
    return x;
    break;
  }
}

function key(axis,val) {
  var command="";
  var value=0;
  switch(axis) {
    case "x":
      control.x = control.x + val;
      control.x = limit(control.x);
      sendCommand("x",control.x );
    break;
    
    case "y":
      control.y = control.y + val;
      control.y = limit(control.y);
      sendCommand("y",control.y );
    break;
        
    case "z":
      control.z = control.z + val;
      control.z = limit(control.z);
      sendCommand("z",control.z );
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
  draw(control.x,control.y,control.z);
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
  draw(control.x,control.y,control.z)
});
