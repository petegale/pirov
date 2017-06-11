var socket = io();

socket.on('lightStatus', function(data) {
  if (data=="on") {
    $("#lights").classList.add('button_on');
  } else {
    $("#lights").classList.remove('button_on');
  }
  
});

socket.on('news', function (data) {
	alert (data.width+"x"+data.height)
});

socket.on('logging', function (data) {
  if (data=="true") {
    //logging has been turned on
    document.getElementById("logging").classList.add('button_on');
    document.getElementById("control_data").style.display="block";
  } else {
    document.getElementById("logging").classList.remove('button_on');
    document.getElementById("control_data").style.display="none";
  }
});


socket.on('liveStream', function(Stream_url) {
  document.getElementById("StartStreamButton").classList.add('button_on');
  var stream = document.getElementById('stream');
  setTimeout(function(){ stream.src=Stream_url; }, 1000);
  });
});

function sendCommand(c,x) {
  if (c=="t") {
    x=x-50
    document.getElementById("thrust_out").innerHTML = "Thrust: "+x;
  }
  if (c=="v") {
    x=Math.round(x*50);
    document.getElementById("vert_out").innerHTML = "Vertical: "+x;
  }
  if (c=="r") {
    x=Math.round(x*50);
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
    document.getElementById('thrust').value=50;
    sendCommand('t',50); 
  });
  LightButton.addEventListener('click', function() {
    sendCommand('lights','toggle'); 
  });
  LogButton.addEventListener('click', function() {
    sendCommand('log','toggle'); 
  });
  
  StartStreamButton.addEventListener('click', function() {
    var sW = document.getElementById("streamcontainer").offsetWidth
    var sH = document.getElementById("streamcontainer").offsetHeight
    socket.emit('start-stream', { width : sW, height : sH });
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
      sendCommand("v",y);
  });
  joystickView.bind("horizontalMove", function(x){
      $("#xVal").html(x);
      //Call Socket.io function to emit horizontal move x
      sendCommand("r",x);
  });
  
  
});
