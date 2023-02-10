const express = require('express');
const bcrypt = require("bcrypt");
const fs = require('fs');
const http = require('http');

const app = express();

app.set('viewengine', 'ejs');
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const FileServerIP = 'localhost'
const FileServerPort = 3001
const IPaddress = 'localhost'
const PortNummber = 3000

const mysql = require('mysql');

let currentUser;

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

  if (currentUser == null) {
    res.send("Session expired");
    res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
  }
  else {
    GetUserImages(currentUser, res);
  }

});

app.get('/accountmain-page/accountmain-style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/accountmain-page/accountmain-style.css');
});

app.get('/accountmain-page/accountmain-script.js', async (req, res) => {
  await res.send(__dirname + '/homepage/accountmain-page/accountmain-script.js');
});

app.get('/Logout', async(req,res)=>{
  currentUser = null;
  res.redirect("http://" + IPaddress + ':' + PortNummber + '/')
})

app.post('/createAccount', async (req, res) => {
  console.log(req.body);
  UserValidation(res, req.body.username, req.body.password, req.body.confirmpassword);
});

app.post('/signIn', async (req, res) => {
  console.log(req.body);
  UserSignIn(res, req.body.username, req.body.password);
});

app.all('*', function (req, res) {
  res.send("404 not found")
});

app.listen(3000, (req,res) => {
  console.log('Our express server is up on port 3000');
});

//Gets all the locations of files stored on file storage
async function GetUserImages(currentUser, result) {

  //Puts username into a json object to be sent
  let sendUsername = JSON.stringify({
    'user': currentUser
  });

  let getDirOptions = {
    hostname: FileServerIP,
    path: '/getUserDirectory',
    port: FileServerPort,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(sendUsername)
    }
    
};
    
//Requests from storage server all files stored in a users folder
let reqDir = http.request(getDirOptions, (res) => {
    let userDirInfo = ''
     
    //Gets the chunked data recieved from storage server
    res.on('data', (chunk) => {
      userDirInfo += chunk;
    });
    
    //Ending the response 
    res.on('end', () => {
      //Ends the stream of data once it reaches an end
      reqDir.end()

      //JSON parse the data recieved so it can be read
      console.log('Body:', JSON.parse(userDirInfo))
      parsedData = JSON.parse(userDirInfo)

      //Checks whether there is data that has been sent
      if(parsedData != undefined){
        //Render the webpage and gives users directory info
        result.render('accountmain.ejs', { userName: currentUser, Image: parsedData.userDir, server_location: FileServerIP + ':' + FileServerPort + '/', webserver_location: IPaddress + ':' + PortNummber + "/Logout"});
      }
      else{
        result.render('accountmain.ejs', { userName: currentUser, ImageSource: undefined});
      }
    });
  }).on("error", (err) => {
    console.log("Error: ", err)
    //Sends username to storage server to be used to get the correct users directory information
  }).end(sendUsername)

  }

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
        res.redirect('http://' + IPaddress +':' + PortNummber+'/accountmain-page/accountmain.html');

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

  //Check if passwords match
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
        console.log(user, "doesn't exist, creating profile")
        CreateUserAccount(user, password)
        res.redirect('http://' + IPaddress +':' + PortNummber+ '/');
      }
      else {
        console.log("user already exists:", user)
        res.send("username already exists")
      }
    })
  }
}

//Create user account
async function CreateUserAccount(user, password) {
  plaintextPassword = password;

  //Turns username into a JOSN object 
  let createUserDirectory = JSON.stringify({
    'user': user
  });

  // options to send to storage server and puts username in header so server knows what to 
  //call the new directory
  let options = {
    hostname: FileServerIP,
    port: FileServerPort,
    path: '/CreateUserDirectory',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createUserDirectory)
    }
  }

  //Sends request to storage server 
  let createNewDirectory = http.request(options, async (res) => {  
    let userDirectoryFromServer = '' 
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      //Puts chunked data recieved into a variable
      userDirectoryFromServer += chunk;
    });
    
    // Ending the response 
    res.on('end', () => {
        //Ends stream to server
        createNewDirectory.write(createUserDirectory)
        createNewDirectory.end()

        //Parses data recieved from server
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