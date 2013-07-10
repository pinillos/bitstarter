var fs = require('fs');

var express = require('express');

var app = express.createServer(express.logger());

var entrada = "index.html";

var buf = fs.readFileSync(entrada, buffer);

var salida = buf.toString();

app.get('/', function(request, response) {
  response.send(salida);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
