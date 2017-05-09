var socket = io();

socket.on('news', function (data) {
	alert (data.width+"x"+data.height)
});

window.addEventListener("load", function(){

  var button = document.getElementById('hello');

  button.addEventListener('click', function() {
    var sW = document.getElementById("streamcontainer").offsetWidth
    var sH = document.getElementById("streamcontainer").offsetHeight
      socket.emit('click-test', { width : sW, height : sH });
  });

});
