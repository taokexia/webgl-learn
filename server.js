const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  console.log(req.url)
  if(req.url == '/test8') {
    fs.readFile('./test8/index.html', (err, data) => {
      if(err) {
        res.write('打开文件出错!');
      } else {
        res.write(data);
      }
      res.end();
    })
  } else {
    fs.readFile('.' + req.url, (err, data) => {
      if(err) {
        res.write('打开文件出错!');
      } else {
        res.write(data);
      }
      res.end();
    })
  }
})

console.log('开始监听...')
server.listen(8080);