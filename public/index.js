const http = require('http');
const url = require('url');
const debugging = true;
const hostname = '127.0.0.1';
const port = 3000;
const debug = debugging ? console.log : function() {};
var tasks = [
  // "node ~/cssh/node/mandelbrot.js",
  // "node ~/cssh/node/mandelbrot.js"
];
var removeTasks = true;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  let temp;
  if(removeTasks) {
    temp = tasks.shift() || "0";
  } else {
    let num = url.parse(req.url, true).query.cycle;
    temp = num < tasks.length ? tasks[num] : "0";
  }
  res.end(temp + "\n");
  debug(`Connection from ${req.connection.remoteAddress.match(/.*:((?:\d+\.){3}\d+)/)[1]}. Sent: ${temp}`)
});

server.listen(port);
process.on('message', function(m) {
  switch(m.type) {
    case "addTask":
      tasks.push(m.data);
      break;
    case "setTasks":
      tasks = m.data;
      break;
    case "setTaskRemovalType":
      removeTasks = m.data;
      break;
  }
});
