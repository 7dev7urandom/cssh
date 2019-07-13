const http = require('http');
const exec = require('child_process').exec;
var result;
var keepGoing = true;
var cycle = 0;
function run(){
  result = "";
  if(!keepGoing) return;
  http.get('http://192.168.0.108:3000/?cycle='+cycle, (resp) => {
    resp.on('data', chunk => result += chunk);
    resp.on('end', () => {
      //console.log(result);
      if(result == 0){
        keepGoing = false;
      } else {
        //console.log("execing " + result);
        exec(result, (err, stdout, stderr) => {
          if(err) throw err;
          console.log(stdout);
          run();
        })
      }
    });
  });
  cycle++;
}
run();
