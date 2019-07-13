var Client = require('ssh2').Client;
var child_process = require('child_process');
const debugging = true;
var time = process.hrtime();
var conns = [
  // {
  //   host: '192.168.0.112',
  //   port: 22,
  //   username: 'main',
  //   password: 'ubuntu-main'
  // }
  // },
  // {
  //   host: '192.168.0.108',
  //   port: 22,
  //   username: 'main',
  //   password: 'ubuntu-main'
  // }
];
process.argv.forEach((e, i) => {
  if(i < 2) return;
  conns.push({
    host: e,
    port: 22,
    username: 'main',
    password: 'ubuntu-main'
  });
});
const debug = debugging ? console.log : function() {};
var closed = 0;
var server = child_process.fork('./public/index.js');
var tasks = [
  "rm /var/lib/dpkg/lock",
  "rm /var/lib/dpkg/lock-frontend",
  "rm /var/cache/apt/archives/lock",
  "apt upgrade -y"
];
var consumeTasks = false;
function sendToServer(data){
  server.send(data);
}
server.on('message', (msg) => debug("message from index.js: " + msg));
sendToServer({ type: "setTasks", data: tasks });
sendToServer({ type: "setTaskRemovalType", data: consumeTasks })
for(let i = 0; i < conns.length; i++){
  let conn = new Client();
  conn.on('ready', function() {
    debug('Client :: ready');
    conn.exec(`echo "${conns[i].password}" | sudo -S node ~/cssh/node/run.js`, function(err, stream) {
      if (err) throw err;
      stream.on('close', function(code, signal) {
        debug('Stream :: close :: code: ' + code + ', signal: ' + signal);
        //debug(conn);
        conn.end();
        if(++closed >= conns.length){
          time = process.hrtime(time);
          debug(`Time to execute ${tasks.length} items over ${conns.length} connection${conns.length > 1 ? "s" : ""}: ${time[0]}.${time[1]}s`);
          server.kill();
        }
      }).on('data', function(data) {
        debug(`STDOUT ${conns[i].host}: \n` + data);
      }).stderr.on('data', function(data) {
        debug(`STDERR ${conns[i].host}: \n` + data);
      });
    });
  }).connect(conns[i]);
}
