const threshold = 5;
const loopTimes = 50;
const mag = 600;
//var time = process.hrtime();
function isMandelbrot(num1, num2, iter) {
  let u1 = num1, u2 = num2;

  for(i = 0; i < iter; i++){
    u1 = u1 ** 2 - u2 ** 2 + num1;
    u2 = 2 * u1 * u2 + num2;
  }
  if(u1 * u2 < threshold) return false;
  return true;
}
let ctrue = 0, cfalse = 0;
for(let x = 0; x < 5000; x++){
  for(let y = 0; y < 5000; y++){
    isMandelbrot(x/mag, y/mag, loopTimes) ? ctrue++ : cfalse++;
  }
}
console.log(ctrue, cfalse);
//time = process.hrtime(time);
//console.log(time[0] + "s", time[1] / 1000000 + "ms");
