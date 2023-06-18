const bcrypt = require("bcrypt");
const http = require("http");
const crypto = require("crypto");

//Get
const file = require("./webServer_configuration.json");
const database_config = require("./database_config.json");
const database_access = require("./Database/MyDataCRUD.js");

const FileServerIP = file.FileServerIP;
const FileServerPort = file.FileServerPort;
const IPaddress = file.WebServerIP;
const PortNummber = file.WebServerPort;

let user;
let password;
let confirm_password;

async function UserValidation(res, req) {
  //Get information from request
  user = req.body.username;
  password = req.body.password;
  confirm_password = req.body.confirm_password;

  //Check passwords match before continuing
  if (password == confirm_password) {
    if (await database_access.UserExist(user) == false) {
      CreateUserAccount(
        user,
        password
      );
      res.statusCode = 200;
      res.send("OK");
      return
    }

    console.log("user already exists:", user);
    res.statusCode = 400;
    res.send("Bad Request");

    return;
  }

  console.log("passwords don't match:");
  res.statusCode = 400;
  res.send("Bad Request");
}

//Create user account
async function CreateUserAccount(
  user,
  password
) {
  plaintextPassword = password;

  //generate random string for directory name
  var directoryname = crypto.randomBytes(10).toString("base64url");

  //Turns username into a JOSN object
  let createUserDirectory = JSON.stringify({
    user: directoryname,
  });

  // options to send to storage server and puts username in header so server knows what to
  //call the new directory
  let options = {
    hostname: FileServerIP,
    port: FileServerPort,
    path: "/CreateUserDirectory",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(createUserDirectory),
    },
  };

  //Sends request to storage server
  let createNewDirectory = http
    .request(options, async (res) => {
      let userDirectoryFromServer = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        //Puts chunked data recieved into a variable
        userDirectoryFromServer += chunk;
      });
      // Ending the response
      res.on("end", () => {
        //Ends stream to server
        createNewDirectory.write(createUserDirectory);
        createNewDirectory.end();

        //Hashing passowrd
        bcrypt.genSalt(10, async (err, salt) => {
          bcrypt.hash(plaintextPassword, salt, async function (err, hash) {

            //Set up user profile
            database_access.CreateUser(user, hash, directoryname);

          });
        });
      });
    })
    .on("error", (err) => {
      console.log("Error: ", err);
    })
    .end(createUserDirectory);

  createNewDirectory;
}

module.exports = { UserValidation };
