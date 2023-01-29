const express = require('express');
const bcrypt = require("bcrypt")
var fs = require('fs');

const app = express();
 
app.use(express.json());
app.use(express.urlencoded({extended:false}));

var mysql = require('mysql');
const { Console } = require('console');

var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "userprofile"
});

app.get('/', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/login.html');
});

app.get('/style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/style.css');
});

app.get('/createaccount-page/create-account.html', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/createaccount-page/create-account.html');
});

app.get('/createaccount-page/createpage-style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/createaccount-page/createpage-style.css');
});

app.post('/check', async (req, res)=> {
  console.log(req.body);
  UserValidation(res,req.body.username, req.body.password,req.body.confirmpassword);
});

app.post('/validate', async (req, res)=> {
  console.log(req.body);
  UserSignIn(res,req.body.username, req.body.password);
});

app.all('*', function(req, res) {
  res.send("404 not found")
});

app.listen(3000, () => {
  console.log('Our express server is up on port 3000');
});

async function UserSignIn(res,user, password){
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
  });

  connection.query("SELECT * FROM user", async function (err, result, fields) {
    if (err) throw err;
    userProfiles = result;
    console.log(result);
  });

  connection.query('INSERT INTO user SET ?', userDetails, async function(err,result){
    if(err) throw err;
    console.log("user added")
    });
}

async function UserValidation(res,user, password, confirm_password){
  if(password != confirm_password){
    console.log("passwords don't match")
    res.send("Passowrds don't match, redirecting...")
  }
  else{
    console.log('password matches')
    res.send("")
    CreateUserAccount(user,password)
  }
}

async function CreateUserAccount(user,password){
  plaintextPassword = password;
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");
  });

  var userdirectory = __dirname + "/UserFolders/"+ user;

  //Hashing passowrd
  bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(plaintextPassword, salt, async function(err, hash) {
            const userDetails = {username: user, password: hash, userdirectory}
            connection.query('INSERT INTO user SET ?', userDetails, async function(err,result){
              if(err) throw err;
              console.log("user added")
              })
        });
    });

    //Create directory where user files stored
    var folderName = user;
    try {
      if (!fs.existsSync(userdirectory)) {
        fs.mkdirSync(userdirectory);
        console.log("Created user folder", user)
      }
    } catch (err) {
      console.error(err);
    }
}

/*
const http = require('http')

const express = require('express');
let bp = require('body-parser');
const exp = require('constants');

const hostname = '127.0.0.1'
const port = 3000
const fs = require('fs').promises;

const app = express();

app.use(express.urlencoded({extended:false}));

const server = http.createServer(async (req, res) => {
  switch (req.url) {
    case "/":
        var contents = await fs.readFile("homepage/login.html");
        res.end(contents);
        break;
    case "/style.css":
        var contents = await fs.readFile("homepage/style.css");
        res.end(contents);
        break;
    case '/createaccount-page/create-account.html':
      var contents = await fs.readFile("homepage/createaccount-page/create-account.html");
        res.end(contents);
      break;
    case '/createaccount-page/createpage-style.css':
      var contents = await fs.readFile("homepage/createaccount-page/createpage-style.css");
      res.end(contents);
      break;
    case "/index.js":
        var contents = await fs.readFile("index.js");
        res.end(contents);
        break;
    case "/createaccount-page/create-account-logic.js":
        var contents = await fs.readFile("homepage/createaccount-page/create-account-logic.js");
        res.end(contents);
        break;
    case "/check":
      console.log(req.body);  
      res.write(req.body);
      res.end();
      break;
    case "/validate":
      console.log(req.body);
      res.write("recieve");
      res.end()
      break;
    default:
        res.writeHead(404);
        res.end("404 not found")
        return;
  }
})

app.post('/check', function(req,res){
console.log(req.body);
res.send('OK')
})
*/

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
