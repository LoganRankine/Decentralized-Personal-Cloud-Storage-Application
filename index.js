const express = require('express');
const bcrypt = require("bcrypt");
let formidable = require('formidable');
let waitOn = require('wait-on');
let fs = require('fs');
var http = require('http');
const session = require('express-session');
const { body, validationResult } = require('express-validator');



const app = express();

app.set('viewengine', 'ejs');
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var mysql = require('mysql');

let user_directoty;
let currentUser;
let createUserDirectory
let userDirectoryFromServer = ''

//Create connection to MySQL database
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "userprofile"
});

//Connect to MySQL database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected");
});

//options to send request to storage server
let options;

//Sends request to server to create new directory when a user is created
let createNewDirectory 

app.post('/accountmain-page/fileupload', async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var oldpath = files.filetoupload.filepath;
    var newpath = user_directoty + "/" + files.filetoupload.originalFilename;
    fs.rename(oldpath, newpath, function (err) {
      if (err) throw err;
      res.write('File uploaded and moved!');
      res.end();
    });
  });
});

app.get('/accountmain-page/Image_1.JPG', async (req, res) => {
  var content = __dirname + '/homepage/accountmain-page/Image_2.JPG';
  await res.sendFile(__dirname + '/homepage/accountmain-page/Image_1.JPG');
});

app.get('/', async (req, res) => {
  await res.render('login.ejs');
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

app.get('/accountmain-page/accountmain.html', async (req, res) => {
  
  //await res.sendFile(__dirname + '/homepage/accountmain-page/accountmain.html');
  
  if (currentUser == null) {
    res.send("Session expired");
    res.redirect('http://localhost:3000/');
  }
  else {
    GetUserImages(user_directoty, res);
  }

});

var file;

async function GetUserImages(p_userDirectoty, res) {
  let myPromise = new Promise(function (resolve) {
    fs.readdir(p_userDirectoty, (error, files) => {
      if (error) console.log(error)
      files.forEach(file => console.log(file))
      if (files != undefined) {
        resolve(files);

        res.render('accountmain.ejs', { userName: currentUser, Image: files, ImageSource: '/getimages', ImageName: files[0]});
        file = files;
      }
      else{
        //there is no files
        res.render('accountmain.ejs', { userName: currentUser, ImageSource: undefined});
      }
    })
  });
  file = await myPromise.then();
}

app.get('/getimages', async (req, res) => {
  res.sendFile(user_directoty +'/'+ file[1]);
  console.log('Images sent', file[1])
});

app.get('/accountmain-page/accountmain-style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/accountmain-page/accountmain-style.css');
});

app.get('/accountmain-page/accountmain-script.js', async (req, res) => {
  await res.send(__dirname + '/homepage/accountmain-page/accountmain-script.js');
});

app.post('/createAccount', async (req, res) => {
  console.log(req.body);
  UserValidation(res, req.body.username, req.body.password, req.body.confirmpassword);
});

app.post('/signIn', async (req, res) => {
  console.log(req.body);
  UserSignIn(res, req.body.username, req.body.password);
});

app.all('*', function (req, res) {
  if(req.url.toString().includes(currentUser)){
    var remove = user_directoty + req.url.toString().replace('accountmain-page/'+currentUser+'/' ,'/');
    res.sendFile(remove);
  }
  else{
    res.send("404 not found")
  }
});

app.listen(3000, (req,res) => {
  console.log('Our express server is up on port 3000');
});

async function UserSignIn(res, user, password) {
  //check if user exists
  connection.query("SELECT * FROM user WHERE username=" + "'" + user + "'", async function (err, result, fields) {
    if (err) throw err;

    //checks if anything is recieved back. Most likeley means username doesn't exist
    if (result.length == 0) {
      res.send("Incorrect username or password");
      console.log("Username doesn't exist")
    }

    // username exists, checking password
    else {
      var dataRecieved = result[0];

      //compares password recieved from user to password recieved from server
      if (await comparePassword(password, dataRecieved.password) == true) {

        //Takes user to account and sets their directory
        res.redirect('http://localhost:3000/accountmain-page/accountmain.html');
        user_directoty = dataRecieved.userDirectory;
        currentUser = user;
        console.log('User signed in:', user);
      }
      else {
        res.send("Incorrect username or password");
        console.log('password incorrect')
      }
    }
  });
}

async function comparePassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}

async function UserValidation(res, user, password, confirm_password) {
  var passwordMatch = false;
  if (password != confirm_password) {
    console.log("passwords don't match")
    res.send("Passowrds don't match, redirecting...")
  }
  else {
    passwordMatch = true;
    console.log('password matches')

  }
  //check if user exists already
  if (passwordMatch == true) {
    connection.query("SELECT * FROM user WHERE username=" + "'" + user + "'", async function (err, result, fields) {
      if (err) throw err;
      if (result.length == 0) {
        CreateUserAccount(user, password)
        res.redirect('http://localhost:3000/');
      }
      else {
        console.log("user already exists:", user)
        res.send("username already exists")
      }
    })
  }
}

async function CreateUserAccount(user, password) {
  plaintextPassword = password;
  createUserDirectory = JSON.stringify({
    'user': user
  });

  options = {
    hostname: 'localhost',
    port: 3001,
    path: '/CreateUserDirectory',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createUserDirectory)
    }
  }

  createNewDirectory = http.request(options, async (res) => {   
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      userDirectoryFromServer += chunk;
    });
    
    // Ending the response 
    res.on('end', () => {
        createNewDirectory.write(createUserDirectory)
        createNewDirectory.end()
        console.log('Body:', JSON.parse(userDirectoryFromServer))

        let directory = JSON.parse(userDirectoryFromServer)
        //Hashing passowrd
        bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(plaintextPassword, salt, async function (err, hash) {
        //Create JSON object with details to add user to database
        const userDetails = { username: user, password: hash, userDirectory: directory.CreatedDirectory}

        //Insert new user details into SQL database
        connection.query('INSERT INTO user SET ?', userDetails, async function (err, result) {
        if (err) throw err;
          console.log("user added:", user)
        })
        });
    });
    });
       
  }).on("error", (err) => {
    console.log("Error: ", err)
  }).end(createUserDirectory)

  await createNewDirectory;

  //var userdirectory = __dirname + "/UserFolders/" + user;
  
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