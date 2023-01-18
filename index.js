const http = require('http')

const hostname = '127.0.0.1'
const port = 3000
const fs = require('fs').promises;

const server = http.createServer(async (req, res) => {
  
  switch (req.url) {
    case "/":
        var contents = await fs.readFile("login.html");
        res.end(contents);
        break;
    case "/style.css":
        var contents = await fs.readFile("style.css");
        res.end(contents);
        break;
    case "/index.js":
        var contents = await fs.readFile("index.js");
        res.end(contents);
        break;
    default:
        res.writeHead(404);
        res.end("404 not found")
        return;
        break;
  }

})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

/*
  fs.readFile(__dirname + "/login.html")
  .then(contents => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
  })
  .catch(err => {
      res.writeHead(500);
      res.end(err);
      return;
  });
*/
