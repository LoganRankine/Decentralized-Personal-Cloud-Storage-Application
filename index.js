const express = require('express');
const bcrypt = require("bcrypt");
const fs = require('fs');
const http = require('http');
const cookieParser = require('cookie-parser');
const crypto = require('crypto')
const mysql = require('mysql');
const cors = require('cors')

const file = require("./webServer_configuration.json")
const database_config = require("./database_config.json")

/*
const example_class = require('./example_class')
const temp = new example_class()
*/
const signIn = require('./SignInClass') 
const createUser = require('./CreateUserClass') 
const userPage = require('./UserPageClass') 
const renameFile = require('./RenameFileClass') 
const dateUploaded = require('./dateUploadedClass')


let UserTokens = [];

const app = express();


app.use(cookieParser());
app.set('viewengine', 'ejs');
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const FileServerIP = file.FileServerIP
const FileServerPort = file.FileServerPort
const IPaddress = file.WebServerIP
const PortNummber = file.WebServerPort

app.use(cors({origin: FileServerIP}))

//Create connection to MySQL database
var connection = mysql.createConnection({
  host: database_config.host,
  user: database_config.user,
  password: database_config.password,
  database: database_config.database,
  multipleStatements: true
});

//Connect to MySQL database
connection.connect(async function (err) {
  if (err) throw err;
  console.log("connected");
});

//adds the date the file was uploaded
app.post('/dateUploaded',async (req,res)=>{
  //
  await dateUploaded.dateUploaded(connection,req,res)

})

app.get('/', async (req, res) => {
  await res.render('login.ejs');
});

app.get('/style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/style.css');
});

app.get('/CreateAccount', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/createaccount-page/create-account.html');
});

app.get('/createpage-style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/createaccount-page/createpage-style.css');
});

app.get('/AccountPage', async (req, res) => {
  
  console.log(req.cookies) 

  if(req.cookies.SessionID == null){
    res.send("Session expired");
    //res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
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

app.get('/accountmain-style.css', async (req, res) => {
  await res.sendFile(__dirname + '/homepage/accountmain-page/accountmain-style.css');
});

app.get('/scriptFile/accountmain-script.js', async (req, res) => {
  await res.sendFile(__dirname + '/views/scriptFile/accountmain-script.js');
});

app.delete('/Logout', async(req,res)=>{
  var cookie = req.cookies.SessionID
  if(cookie != undefined){
    RemoveToken(cookie)
    res.clearCookie("SessionID")
    
    res.redirect("http://" + IPaddress + ':' + PortNummber + '/')
  }
  else{
    res.redirect("http://" + IPaddress + ':' + PortNummber + '/')
  }
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
  createUser.UserValidation(connection,res)

});

app.post('/signIn', async (req, res) => {
  console.log(req.body);
  
  const usertoken = await signIn.UserSignIn(connection, res, req.body.username, req.body.password, PortNummber,IPaddress)
  UserTokens.push(usertoken)
});

app.delete('/delete/*', async (req,res)=>{
  ///delete/Euu7McoxAJSM4qr25C02meZcPSw/37
  //get url
  let URLrequest = req.url.toString()
  //Split and get which user is making request
  let userToken = URLrequest.split('/')[2]
  //Split and get what file needs removing
  let fileID = URLrequest.split('/')[3]

  //Find the user details making request
  UserTokens.forEach(user =>{
    if(user.SessionID == userToken){
      const currentUser = user
      const sqlQuery = "DELETE FROM `userprofile`.`fileinformation` WHERE (`FileID` = '"+ fileID +"')"
      const sqlQuery2 = "DELETE FROM `userprofile`.`fileid` WHERE (`FileID` = '"+ fileID +"') and (`UserID` = '"+ currentUser.iduser +"');"
      connection.query(sqlQuery,async function (err, result, fields){
        console.log(result)
      })
      connection.query(sqlQuery2,async function (err, result, fields){
        console.log(result)
      })
      console.log('User found', user.UserName)
    }
  })
  console.log('deleting file')

})

app.put('/rename', async (req,res)=>{
console.log(req.body)
console.log('rename request recieved')

const b_user = req.body.user

UserTokens.forEach(async (user)=>{
  if(user.SessionID == b_user){
    await renameFile.RenameFile(connection, req.body, user.UserID)
    res.send('OK')
  }
})

})

app.all('*', async (req, res)=> {
  res.send("404 not found")
});

app.get("/test/newUserCreated", async (res,req)=>{
  res.send('newUserCreated')
})

app.listen(PortNummber, (req,res) => {
  console.log('Web server is running on IP address:', IPaddress +',','Port number:',PortNummber);
});


