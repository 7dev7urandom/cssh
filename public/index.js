const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;
var tasks = [
  "node ~/cssh/node/mandelbrot.js",
  "node ~/cssh/node/mandelbrot.js"
];
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  let temp = tasks.shift();
  res.end(temp || "0" + "\n");
  console.log(`Connection. Sent: ${temp || "0"}`)
});

server.listen(port);
process.send(tasks);
