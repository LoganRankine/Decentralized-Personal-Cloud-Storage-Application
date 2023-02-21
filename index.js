const express = require('express');
const bcrypt = require("bcrypt");
const fs = require('fs');
const http = require('http');
const cookieParser = require('cookie-parser');
const crypto = require('crypto')
const mysql = require('mysql');

/*
const example_class = require('./example_class')
const temp = new example_class()
*/
const signIn = require('./SignInClass') 
const createUser = require('./CreateUserClass') 
const userPage = require('./UserPageClass') 


let UserTokens = [];

const app = express();

app.use(cookieParser());
app.set('viewengine', 'ejs');
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const FileServerIP = '10.125.5.177'
const FileServerPort = 3001
const IPaddress = '10.125.5.177'
const PortNummber = 3000

//Create connection to MySQL database
var connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "userprofile",
  multipleStatements: true
});

//Connect to MySQL database
connection.connect(async function (err) {
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

  if(req.cookies.SessionID == null){
    res.send("Session expired");
    res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
  }
  else{
    let sessionID = req.cookies.SessionID
    let user;
    UserTokens.forEach(element=>{
      if(element.SessionID == sessionID){
        user = element
      }
    })
    userPage.GetUserImages(user, res, req, connection,FileServerIP,FileServerPort,IPaddress,PortNummber)
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
  currentUserID = null;
  var cookie = req.cookies.SessionID
  RemoveToken(cookie)
  res.clearCookie("SessionID")
  
  res.redirect("http://" + IPaddress + ':' + PortNummber + '/')
})

async function RemoveToken(p_session_ID){
  let newArray = [];
  UserTokens.forEach(element =>{
    if(element.SessionID != p_session_ID){
      newArray.push(element)
    }
  })
  console.log('Cookie removed:',p_session_ID)
  UserTokens = newArray
}

app.post('/createAccount', async (req, res) => {
  console.log(req.body);
  createUser.UserValidation(connection,res, req.body.username, req.body.password, req.body.confirmpassword,IPaddress,PortNummber, FileServerIP,FileServerPort)
  //UserValidation(res, req.body.username, req.body.password, req.body.confirmpassword);
});

app.post('/signIn', async (req, res) => {
  console.log(req.body);
  
  const usertoken = await signIn.UserSignIn(connection, res, req.body.username, req.body.password, PortNummber,IPaddress)
  UserTokens.push(usertoken)
});

app.all('*', function (req, res) {
  res.send("404 not found")
});

app.listen(PortNummber, (req,res) => {
  console.log('Web server is running on IP address:', IPaddress +',','Port number:',PortNummber);
});
