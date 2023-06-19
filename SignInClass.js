const bcrypt = require("bcrypt");
const crypto = require("crypto");
const file = require("./webServer_configuration.json");
const database_access = require("./Database/MyDataCRUD.js");
const IPaddress = file.WebServerIP;
const PortNummber = file.WebServerPort;
var session;

async function UserSignIn(res, req) {
  //Get username and password
  let user = req.body.username;
  let password = req.body.password;

  //Check username and password is correct
  let userObject = await database_access.UserExistObject(user);
  if (userObject != undefined) {
    //Compare password against database
    if ((await comparePassword(password, userObject.password)) == true) {
      if(await GenerateToken(res,user) == true){
        res.statusCode = 200
        res.send('OK')
        return 
      }
    }
  }

  res.statusCode = 400;
  res.send("Bad Request");
  console.log("Username doesn't exist");

  //check if user exists
}

async function comparePassword(password, hash) {
  const result = await bcrypt.compare(password, hash);
  return result;
}

async function GenerateToken(res, user) {
  //Generate random string to be used as cookie token
  const newUserToken = crypto.randomBytes(20).toString("base64url");

  //Cookie options
  const options = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
  };
  //set cookie
  res.cookie("SessionID", newUserToken, options);

  if(await database_access.AddUserToken(user, newUserToken) == true){
    return true
  }

  return false;
}

module.exports = { UserSignIn };
