const express = require('express');
const bcrypt = require("bcrypt");
const fs = require('fs');
const http = require('http');
const cookieParser = require('cookie-parser');

/*
const example_class = require('./example_class')
const temp = new example_class()
*/

const app = express();

app.use(cookieParser());
app.set('viewengine', 'ejs');
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const FileServerIP = '10.0.0.15'
const FileServerPort = 3001
const IPaddress = '10.0.0.15'
const PortNummber = 3000

const mysql = require('mysql');

let currentUser;
let currentUserID;

//Create connection to MySQL database
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "userprofile",
  multipleStatements: true
});

//Connect to MySQL database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected");
});

//adds the date the file was uploaded
app.post('/dateUploaded',async (req,res)=>{
  const r_username = req.body.user
  const r_filename = req.body.filename
  const r_dateuploaded = req.body.dateuploaded
  let r_fileType = req.body.filename.slice(-3)

  //Get the users ID from database
  connection.query("SELECT * FROM user WHERE username=" + "'" + r_username + "'", async function (err, userID) {
    if (err) throw err;
    
      //Once UserID recieved. Add UserID to FileID Table, file id is auto incremented
      const addTofileID = { UserID: userID[0].iduser}
      connection.query('INSERT INTO fileid SET ?', addTofileID, async(err,fileID)=>{
      if (err) throw err;
      const addTofileInfo = { FileID: fileID.insertId ,filename: r_filename, dateuploaded: r_dateuploaded, filetype: r_fileType}

      //Once UserID added to FileID. Use the FileID recieved to add fileID and info to 
      //fileinformation table
      connection.query('INSERT INTO fileinformation SET ?', addTofileInfo, async(err,result)=>{
        if (err) throw err;
        console.log('File information added: ', 'Filename:',r_filename,', Date Uploaded:',r_dateuploaded)
      })
    })
  })
})

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

  console.log(req.cookies) 

  if(req.cookies.userID == null){
    res.send("Session expired");
    res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
  }
  else{
    GetUserImages(req.cookies.userID, res, req);
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

app.listen(PortNummber, (req,res) => {
  console.log('Our express server is up on port 3000');
});

//Gets all the locations of files stored on file storage
async function GetUserImages(p_userID, res, req) {

  let sql = "SELECT fileinformation.filename, fileinformation.dateuploaded, fileinformation.filetype FROM fileid JOIN user on fileid.UserID=user.iduser JOIN fileinformation on fileid.FileID=fileinformation.FileID WHERE FileID.UserID=" + p_userID
  connection.query(sql, async function(err,result){
    if(err) throw err;

    parsedData = result
    //Checks whether there is data that has been sent
    if(parsedData != undefined){
      res.render('accountmain.ejs', { userName: req.cookies.userName, Image: parsedData, server_location: FileServerIP + ':' + FileServerPort + '/', webserver_location: IPaddress + ':' + PortNummber + "/Logout"});
    }
    else{
      res.render('accountmain.ejs', { userName: req.cookies.userName, ImageSource: undefined});
    }

    
  })

  }

  async function getDates(userID){
    
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
        let options = {
          maxAge: 1000 * 60 * 15, // would expire after 15 minutes
          httpOnly: true, // The cookie only accessible by the web server
        }
        //set cookie
        res.cookie('userID', dataRecieved.iduser, options)
        res.cookie('userName', dataRecieved.username,options)
        res.redirect('http://' + IPaddress +':' + PortNummber+'/accountmain-page/accountmain.html');

        user_directoty = dataRecieved.userDirectory;

        currentUserID = dataRecieved.iduser;

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