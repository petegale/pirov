var socket = io();

socket.on('click-back', function (data) {
	alert ("got data back")
});

window.addEventListener("load", function(){

  var button = document.getElementById('hello');

  button.addEventListener('click', function() {
      socket.emit('click-test', { duration: 2 });
  });

});
