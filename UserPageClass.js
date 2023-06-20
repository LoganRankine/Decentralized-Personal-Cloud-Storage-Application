const http = require("http");
const database_access = require("./Database/MyDataCRUD.js");
const file = require("./webServer_configuration.json");
const FileServerIP = file.FileServerIP;
const FileServerPort = file.FileServerPort;
const IPaddress = file.WebServerIP;
const PortNummber = file.WebServerPort;

//Gets all the locations of files stored on file storage
async function GetUserImages(res, sessionID) {
  var fileinformation = await database_access.GetFileInformation(sessionID);
  return new Promise((resolve, reject) => {

    if(fileinformation != undefined){
      resolve(fileinformation)
      return fileinformation;
    }
    //Get file information from database

    /*
  res.render("accountmain.ejs", {
    userName: 'testing',
    ImageSource: undefined,
  });
  */

    
  });

  /*
  parsedData = result;
  //Checks whether there is data that has been sent
  if (parsedData != undefined) {
    //Send ALL entries retrieved from database to store server- Retruns with random token
    const files = await GetFileToken(p_userID, parsedData);
    res.render("accountmain.ejs", {
      count: 1,
      SessionID: p_userID.SessionID,
      userName: p_userID.UserName,
      Image: files,
      server_location: FileServerIP + ":" + FileServerPort + "/",
      webserver_location: IPaddress + ":" + PortNummber,
    });
  } else {
    res.render("accountmain.ejs", {
      userName: p_userID.UserName,
      ImageSource: undefined,
    });
  }
  */
}

async function GetFileToken(p_user, p_userFiles) {
  return new Promise((resolve, reject) => {
    let sendFiles = JSON.stringify({
      UserInfo: p_user,
      UserFiles: p_userFiles,
    });

    let sendFileInfoOptions = {
      hostname: FileServerIP,
      path: "/FileTokens",
      port: FileServerPort,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(sendFiles),
      },
    };
    //Requests from storage server all files stored in a users folder
    let sendFileInfoReq = http
      .request(sendFileInfoOptions, (res) => {
        let response = "";

        //Gets the chunked data recieved from storage server
        res.on("data", (chunk) => {
          response += chunk;
        });

        //Ending the response
        res.on("end", () => {
          //Ends the stream of data once it reaches an end
          sendFileInfoReq.end();

          //JSON parse the data recieved so it can be read
          let parsed = JSON.parse(response);
          console.log("Body:", parsed);
          resolve(parsed);
        });
      })
      .on("error", (err) => {
        console.log("Error: ", err);
        //Sends username to storage server to be used to get the correct users directory information
      })
      .end(sendFiles);
  });
}

module.exports = { GetUserImages };
