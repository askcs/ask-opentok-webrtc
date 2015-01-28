var port = (process.env.VCAP_APP_PORT || 9001);

var express = require('express');
var app = express();
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"));

//set all /session routes to the opentok.js
app.use('/session',require('./routes/opentok'))


//create server
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Open tok listening at http://%s:%s', host, port)

})