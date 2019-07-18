const Client = require('ssh2').Client;
const child_process = require('child_process');
const http = require('http');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
var hostname = '127.0.0.1';
var port = 3000;
const debugging = true;
var consumeTasks = false;
const debug = debugging ? send : function() {};
var conns = [];
var tasks = [
  "echo Hi"
];
var time;
var tempTasks;
function send(output){
  mainWindow.webContents.send('output', output + "\n");
}
let mainWindow;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  let temp;
  if(consumeTasks) {
    //debug(tempTasks.length + " " + tasks.length);
    temp = tempTasks.shift() || "0";
  } else {
    let num = url.parse(req.url, true).query.cycle;
    temp = num < tasks.length ? tasks[num] : "0";
    //debug(num);
  }
  res.end(temp + "\n");
  debug(`Connection from ${req.connection.remoteAddress.match(/.*:((?:\d+\.){3}\d+)/)[1]}. Sent: ${temp}`/*.  tasks.length is ${tasks.length} and tempTasks.length is ${tempTasks.length}*/);
});
function start(connList, inpTasks, consume) {
  let closed = 0;
  consumeTasks = consume;
  //debug(`inpTasks: "${inpTasks}"`);
  tasks = inpTasks == "" ? tasks : inpTasks;
  tempTasks = tasks.slice();
  conns = connList;
  server.listen(port);
  time = process.hrtime();
  for(let i = 0; i < conns.length; i++){
    let conn = new Client();
    conn.on('ready', function() {
      debug(conns[i].hostname + ' :: ready');
      conn.exec(`echo "${conns[i].password}" | sudo -S node ~/node_projects/cssh/node/run.js`, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
          debug('Stream :: close :: ip: ' + conns[i].hostname);
          //debug(conn);
          conn.end();
          if(++closed >= conns.length){
            let ntime = process.hrtime(time);
            debug(`Time to execute ${tasks.length} items over ${conns.length} connection${conns.length > 1 ? "s" : ""}: ${ntime[0]}.${ntime[1]}s`);
            server.close();
          }
        }).on('data', function(data) {
          debug(`STDOUT ${conns[i].hostname}: \n` + data);
        });
      });
    }).connect(conns[i]);
  }
}

//electron stuff
ipcMain.on('start', (event, connList, tasks, consumeTasks) => {
  start(connList, tasks, consumeTasks || false);
})

function createWindow() {
  mainWindow = new BrowserWindow({ webPreferences: { nodeIntegration: true }});
  mainWindow.loadFile('public/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}
app.on('ready', createWindow);
app.on('activate', () => mainWindow === null ? createWindow() : null);
app.on('window-all-closed', () => process.platform !== "darwin" ? app.quit() : null);
