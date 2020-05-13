var socket = io.connect('/');
socket.on('msg', function (data) {
  document.getElementById("chat").innerHTML += `${data} <br>`
});
function send() {
  socket.emit('msg',  document.getElementById("chatInput").value)
}
