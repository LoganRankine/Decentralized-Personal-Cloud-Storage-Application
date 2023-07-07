const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const http = require("http");
const https = require("https");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const mysql = require("mysql");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const file = require("./webServer_configuration.json");
const database_config = require("./database_config.json");

/*
const example_class = require('./example_class')
const temp = new example_class()
*/
const signIn = require("./SignInClass");
const createUser = require("./CreateUserClass");
const userPage = require("./UserPageClass");
const renameFile = require("./RenameFileClass");
const dateUploaded = require("./dateUploadedClass");
const deleteFile = require("./DeleteFileClass");
const database_access = require("./Database/MyDataCRUD.js");

//Generate public private key
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 4096,
});
let publicstring;

let UserTokens = [];

const app = express();

app.use(cookieParser());
app.set("viewengine", "ejs");
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const FileServerIP = file.FileServerIP;
const FileServerPort = file.FileServerPort;
const IPaddress = file.WebServerIP;
const PortNummber = file.WebServerPort;

app.use(cors({ origin: FileServerIP }));

//SQLite data
let sqlite = new sqlite3.Database("./Database/userData.db", (err) => {
  if (err) {
    console.log("Database failed to open");
    console.error(err.message);
  }
  console.log("Connected to the user database.");
});

var create =
  "CREATE TABLE [IF NOT EXISTS] userinformation (userid INTEGER  PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, directory TEXT NOT NULL UNIQUE, sessionID TEXT UNIQUE) [WITHOUT ROWID];";

sqlite.serialize(() => {
  /*sqlite.each(`SELECT userinformation.userid FROM userinformation WHERE sessionID = '_pyrQMOKDWPV-NbnrfhWdIk2DRg'`, (err,result)=>{
    console.log(result)
  })*/
  /*
  sqlite.run('CREATE TABLE IF NOT EXISTS userinformation (userid INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, directory TEXT NOT NULL UNIQUE, sessionID TEXT)', (err)=>{
    if(err){
      console.log(err)
    }
    console.log("user information table created")
  });

  sqlite.run('CREATE TABLE IF NOT EXISTS fileinformation (fileid INTEGER  PRIMARY KEY AUTOINCREMENT, filetoken TEXT NOT NULL,filename TEXT NOT NULL UNIQUE, uploadDate TEXT NOT NULL, filetype TEXT NOT NULL)', (err)=>{
    if(err){
      console.log(err)
    }
    console.log("file information table created")
  });

  sqlite.run('CREATE TABLE IF NOT EXISTS fileids (fileid INTEGER  NOT NULL, userid INTEGER NOT NULL, PRIMARY KEY(fileid, userid),FOREIGN KEY(fileid) REFERENCES fileinformation (fileid) ON UPDATE CASCADE ON DELETE CASCADE, FOREIGN KEY(userid) REFERENCES userinformation (userid) ON UPDATE CASCADE ON DELETE CASCADE)', (err)=>{
    if(err){
      console.log(err)
    }
    console.log("file ids table created")
  });
  /*

  sqlite.each('SELECT * FROM fileids', (err, row)=>{
    if(err){
      console.log(err)
    }

    console.log(row)
  })

  sqlite.each('SELECT * FROM fileinformation', (err, row)=>{
    if(err){
      console.log(err)
    }

    console.log(row)
  })
  */
  /*
  sqlite.run("INSERT INTO userinformation(userid,username,password,directory, sessionID) VALUES('1','logan','password','directory','efw2233ree')", (err)=>{
    if(err){
      console.log(err)
    }
    console.log('user created')
  })

  sqlite.all('SELECT * FROM userinformation', (err, row)=>{
    if(err){
      console.log(err)
    }

    console.log(row.username)
  })
  */
});

//Create connection to MySQL database
/*
var connection = mysql.createConnection({
  host: database_config.host,
  user: database_config.user,
  password: database_config.password,
  database: database_config.database,
  multipleStatements: true,
});

//Connect to MySQL database
connection.connect(async function (err) {
  if (err) throw err;
  console.log("connected");
});

*/

//adds the date the file was uploaded
app.post("/addFileToDB?*", async (req, res) => {
  //Get sessionID from request
  var sessionID = req.url.replace("/addFileToDB?sessionID=", "");
  await dateUploaded.dateUploaded(req, res, sessionID);
});

app.get("/authoriseUser?*", async (req, res) => {
  //Get sessionID from request
  var sessionID = req.url.replace("/authoriseUser?sessionID=", "");
  res.send(await database_access.UserExistSessionID(sessionID));
});

app.get("/", async (req, res) => {
  await res.render("login.ejs");
});

app.get("/login.js", async (req, res) => {
  await res.sendFile(__dirname + "/homepage/login.js");
});

app.get("/style.css", async (req, res) => {
  await res.sendFile(__dirname + "/homepage/style.css");
});

app.get("/CreateAccount", async (req, res) => {
  await res.sendFile(
    __dirname + "/homepage/createaccount-page/create-account.html"
  );
});

app.get("/createpage-style.css", async (req, res) => {
  await res.sendFile(
    __dirname + "/homepage/createaccount-page/createpage-style.css"
  );
});

app.get("/create-account-logic.js", async (req, res) => {
  await res.sendFile(
    __dirname + "/homepage/createaccount-page/create-account-logic.js"
  );
});

app.get("/AccountPage", async (req, res) => {
  console.log(req.cookies);

  if (req.cookies.SessionID == null) {
    res.send("Session expired");
    //res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
  } else {
    res.render("accountmain.ejs", {
      userName: "testing",
      ImageSource: undefined,
    });
  }
});

app.get("/getFiles?*", async (req, res) => {
  var sessionID = req.url.replace("/getFiles?SessionID=", "");
  console.log("Session:", sessionID, "request to get file information");

  if (sessionID == null) {
    res.send("Session expired");
    //res.redirect('http://' + IPaddress +':'+ PortNummber+'/');
  } else {
    res.send(await userPage.GetUserImages(res, sessionID));
  }
});

app.get("/accountmain-style.css", async (req, res) => {
  await res.sendFile(
    __dirname + "/homepage/accountmain-page/accountmain-style.css"
  );
});

app.get("/scriptFile/accountmain-script.js", async (req, res) => {
  await res.sendFile(__dirname + "/views/scriptFile/accountmain-script.js");
});

app.get("/scriptFile/loadFiles.js", async (req, res) => {
  await res.sendFile(__dirname + "/views/scriptFile/loadFiles.js");
});

app.delete("/Logout", async (req, res) => {
  var cookie = req.cookies.SessionID;
  if (cookie != undefined) {
    RemoveToken(cookie);
    res.clearCookie("SessionID");

    res.redirect("http://" + IPaddress + ":" + PortNummber + "/");
  } else {
    res.redirect("http://" + IPaddress + ":" + PortNummber + "/");
  }
});

async function RemoveToken(p_session_ID) {
  let newArray = [];
  UserTokens.forEach((element) => {
    if (element.SessionID != p_session_ID) {
      newArray.push(element);
    }
  });
  console.log("Cookie removed:", p_session_ID);
  UserTokens = newArray;
}

app.post("/createAccount", async (req, res) => {
  console.log(req.body);
  createUser.UserValidation(res, req);
});

app.post("/signIn", async (req, res) => {
  console.log(req.body);

  await signIn.UserSignIn(res, req);
});

app.delete("/delete?*", async (req, res) => {
  
  deleteFile.DeleteFile(req, res)

  console.log("deleting file");
});

app.put("/rename?*", async (req, res) => {
  console.log(req.body);
  console.log("rename request recieved");

  await renameFile.RenameFile(req, res);
  res.send("OK");
});

app.get("/getKey", async (req, res) => {
  publicstring = publicKey.export({ format: "pem", type: "spki" });
  publicstring = publicstring.replace("-----BEGIN RSA PUBLIC KEY-----\n", "");
  publicstring = publicstring.replace("\n-----END RSA PUBLIC KEY-----\n", "");

  res.send(publicstring);
});

app.all("*", async (req, res) => {
  res.send("404 not found");
});

app.get("/test/newUserCreated", async (res, req) => {
  res.send("newUserCreated");
});

app.listen(PortNummber, (req, res) => {
  console.log(
    "Web server is running on IP address:",
    IPaddress + ",",
    "Port number:",
    PortNummber
  );
});
