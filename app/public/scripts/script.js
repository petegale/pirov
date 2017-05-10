var socket = io();

socket.on('news', function (data) {
	alert (data.width+"x"+data.height)
});

socket.on('liveStream', function(url) {
  var stream = document.getElementById('stream');
  stream.src=url);
});

window.addEventListener("load", function(){
  var StartStreamButton = document.getElementById('StartStreamButton');
  StartStreamButton.addEventListener('click', function() {
    var sW = document.getElementById("streamcontainer").offsetWidth
    var sH = document.getElementById("streamcontainer").offsetHeight
    socket.emit('start-stream', { width : sW, height : sH });
  });
  
  var StopStreamButton = document.getElementById('StopStreamButton');
  StopStreamButton.addEventListener('click', function() {
    socket.emit('stop-stream');
  });

});
