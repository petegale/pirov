var socket = io();

socket.on('news', function (data) {
	alert (data.width+"x"+data.height)
});

socket.on('liveStream', function(url) {
  var stream = document.getElementById('stream');
  stream.src=url;
  //alert(url)
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
  StopButton.addEventListener('click', function() {
    document.getElementById('thrust').value=50;
    sendCommand('t',50); 
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
