var socket = io();

socket.on('news', function (data) {
	alert (data.hello)
});

window.addEventListener("load", function(){

  var button = document.getElementById('hello');

  button.addEventListener('click', function() {
      socket.emit('click-test', { duration: 2 });
  });

});
