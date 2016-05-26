var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    request = require('request'),
    EventEmitter = require('events').EventEmitter,
    supervisor = new EventEmitter(),
    lockFile = require('lockfile');

// sets lock if it isn't already
lockFile.lock('/data/resin-updates.lock', function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('update lock active');
  }
});

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(80, function(){
  console.log('listening on *:80');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('isUpdate', function(){
    supervisorState(supervisor);
  });

  // forceUpdate and stream supervisor state until restart
  socket.on('forceUpdate', function() {
    forceUpdate();
    setInterval(function(){
      supervisorState(supervisor);
    }, 1000)
  });

  // forward any data from the supervisorto the client
  supervisor.on('data', function(data){
    socket.emit('supervisorState', data);
  });

});

// request data from supervisor
function supervisorState(supervisor) {
  request({
      url: process.env.RESIN_SUPERVISOR_ADDRESS + "/v1/device?apikey=" + process.env.RESIN_SUPERVISOR_API_KEY, //URL to hit
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      },
  }, function(err, httpResponse, body){
    supervisor.emit('data', JSON.parse(body));
  })
}

// forceUpdate regardless of lock
function forceUpdate() {
  request({
      url: process.env.RESIN_SUPERVISOR_ADDRESS + '/v1/update?apikey=' + process.env.RESIN_SUPERVISOR_API_KEY, //URL to hit
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: '{ "force": true }' //Set the body as a string
  }, function(err, httpResponse, body){
    if (!err) {
      console.log('updateForced');
    }
  })
}
