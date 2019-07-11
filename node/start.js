var Client = require('ssh2').Client;
var child_process = require('child_process');
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
var closed = 0;
var server = child_process.fork('./public/index.js');
var tasks;
server.on('message', (msg) => tasks = msg);
for(let i = 0; i < conns.length; i++){
  let conn = new Client();
  conn.on('ready', function() {
    console.log('Client :: ready');
    conn.exec('node ~/cssh/node/run.js', function(err, stream) {
      if (err) throw err;
      stream.on('close', function(code, signal) {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        //console.log(conn);
        conn.end();
        if(++closed >= conns.length){
          time = process.hrtime(time);
          console.log(`Time to execute ${tasks.length} items over ${conns.length} connection${conns.length > 1 ? "s" : ""}: ${time[0]}.${time[1]}s`);
          server.kill();
        }
      }).on('data', function(data) {
        console.log(`STDOUT ${conns[i].host}: ` + data);
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });
    });
  }).connect(conns[i]);
}
