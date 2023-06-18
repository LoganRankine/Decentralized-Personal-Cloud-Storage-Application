const bcrypt = require("bcrypt");
const http = require("http");
const crypto = require("crypto")

//Get
const file = require("./webServer_configuration.json");
const database_config = require("./database_config.json");

const FileServerIP = file.FileServerIP;
const FileServerPort = file.FileServerPort;
const IPaddress = file.WebServerIP;
const PortNummber = file.WebServerPort;

let user;
let password;
let confirm_password;

async function UserValidation(connection, res, req) {

  //Get information from request
  user = req.body.username;
  password = req.body.password;
  confirm_password = req.body.confirm_password;

  //Check passwords match before continuing
  if (password == confirm_password) {
    connection.query(
      "SELECT * FROM user WHERE username=" + "'" + user + "'",
      async function (err, result, fields) {
        if (err) throw err;

        if (result.length == 0) {
          console.log(user, "doesn't exist, creating profile");
          CreateUserAccount(
            user,
            password,
            FileServerIP,
            FileServerPort,
            connection
          );

          res.statusCode = 200;

          res.send("OK");

        } else {
          console.log("user already exists:", user);
          res.statusCode = 400;
          res.send("Bad Request");
        }
      }
    );

    return;
  }

  console.log("passwords don't match:");
  res.statusCode = 400;
  res.send("Bad Request");
}

//Create user account
async function CreateUserAccount(
  user,
  password,
  FileServerIP,
  FileServerPort,
  connection
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

        //Parses data recieved from server
        console.log("Body:", userDirectoryFromServer);
        //Hashing passowrd
        bcrypt.genSalt(10, async (err, salt) => {
          bcrypt.hash(plaintextPassword, salt, async function (err, hash) {
            //Create JSON object with details to add user to database
            const userDetails = {
              username: user,
              password: hash,
              userDirectory: directoryname,
            };

            //Insert new user details into SQL database
            connection.query(
              "INSERT INTO user SET ?",
              userDetails,
              async function (err, result) {
                if (err) throw err;
                console.log("user added:", user);
              }
            );
          });
        });
      });
    })
    .on("error", (err) => {
      console.log("Error: ", err);
    })
    .end(createUserDirectory);

  await createNewDirectory;
}

module.exports = { UserValidation };
