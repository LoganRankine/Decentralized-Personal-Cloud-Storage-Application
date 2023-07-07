const sqlite3 = require("sqlite3").verbose();

//Creates connection to database
async function ConnectToDB() {
  return new Promise(async (resolve, reject) => {
    let sqlite = new sqlite3.Database("./Database/userData.db", (err) => {
      if (err) {
        console.log("Database failed to open");
        console.error(err.message);
        reject(undefined);
      }
      console.log("Connected to the user database.");
      resolve(sqlite);
    });
  });
}

//Create user account
async function CreateUser(username, password, directory) {
  let db = await ConnectToDB();
  if (db != undefined) {
    db.run(
      `INSERT INTO userinformation (username,password,directory,sessionID) VALUES('${username}','${password}','${directory}','NotActivated')`,
      (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`${username} added into database`);
      }
    );
  }
  db.close();
}

//Check if username exists
async function UserExist(username) {
  let db = await ConnectToDB();
  return new Promise(async (resolve, reject) => {
    if (db != undefined) {
      //check if username exists
      db.all(
        `SELECT 1 FROM userinformation WHERE username = '${username}'`,
        (err, row) => {
          if (err) {
            console.error(err);
          }
          console.log(row);
          if (row.length == 1) {
            console.log(username, "exists");

            resolve(true);
            return true;
          }
          resolve(false);

          return false;
        }
      );
    }
  });
}

//Get user using username
async function UserExistObject(username) {
  let db = await ConnectToDB();
  return new Promise((resolve, reject) => {
    if (db != undefined) {
      db.all(
        `SELECT * FROM userinformation WHERE username = '${username}'`,
        (err, result) => {
          if (err) {
            console.error(err);
            db.close();
          }
          console.log(result);
          if (result.length == 1) {
            console.log(username, "exists");
            resolve(result[0]);
            db.close();
            return;
          }

          resolve(undefined);
          db.close();
          return;
        }
      );
    }
  });
}

//Get user using sessionID
async function UserExistSessionID(sessionid) {
  let db = await ConnectToDB();
  return new Promise((resolve, reject) => {
    if (db != undefined) {
      db.each(
        `SELECT userinformation.userid, userinformation.username, userinformation.directory, userinformation.sessionID FROM userinformation WHERE sessionID = '${sessionid}'`,
        (err, result) => {
          if (err) {
            console.error(err);
            throw err;
            db.close();
          }
          console.log(result);
          if (result != undefined) {
            console.log("SessionID:", sessionid, "exists");
            resolve(result);
            db.close();
            return result;
          }
          resolve(undefined);
          db.close();
          return undefined;
        }
      );
    }
  });
}

//Give user session token
async function AddUserToken(username, token) {
  try {
    let db = await ConnectToDB();
    if (db != undefined) {
      db.run(
        `UPDATE userinformation SET sessionID = '${token}' WHERE username = '${username}'`
      );
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function GetFileInformation(sessionid) {
  let db = await ConnectToDB();

  return new Promise((resolve, reject) => {
    try {
      if (db != undefined) {
        db.each(
          `SELECT userinformation.userid FROM userinformation WHERE sessionID = '${sessionid}'`,
          (err, result) => {
            if (err) {
              console.log("Failed to get all of users file information");
              console.error(err);
            }
            //Select users files
            db.all(
              `SELECT fileinformation.filename, fileinformation.uploadDate, fileinformation.filetype, fileinformation.FileID FROM fileids JOIN userinformation on fileids.userid=userinformation.userid JOIN fileinformation on fileids.fileid=fileinformation.fileid WHERE fileids.userid='${result.userid}'`,
              (err, result) => {
                if (err) {
                  console.log("Failed to get all of users file information");
                  console.error(err);
                }
                console.log(result);
                resolve(result);
                return result;
              }
            );
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  });
}

async function AddFileInformation(fileInformation, userInformation) {
  try {
    let db = await ConnectToDB();
    if (db != undefined) {
      db.run(
        `INSERT INTO fileinformation (filetoken, filename, uploadDate, filetype) VALUES('${fileInformation.filetoken}','${fileInformation.filename}','${fileInformation.dateuploaded}', '${fileInformation.filetype}')`,
        function (err) {
          if (err) throw err;

          db.run(
            `INSERT INTO fileids (fileid, userid) VALUES('${this.lastID}', '${userInformation.userid}')`,
            function (err) {
              if (err) throw err;
              console.log(
                `${userInformation.username} file: ${fileInformation.filename} added to database`
              );
            }
          );
        }
      );
    }
  } catch {}
}

async function RenameFileInformation(sessionID, fileID, newFilename) {
  //Ensure sessionID is valid
  let userInformation = await UserExistSessionID(sessionID);
  if (userInformation == undefined) {
    return "sessionID does not exist";
  }

  let db = await ConnectToDB();

  return new Promise((resolve, reject) => {
    try {
      db.run(
        `UPDATE fileinformation SET filename = '${newFilename}' WHERE fileid = '${fileID}'`,
        function (err) {
          if (err) throw err;
          console.log(this.changes);

          //Changes were made
          if (this.changes > 0) {
            console.log(
              `${sessionID}: file:${fileID} name changed to ${newFilename}`
            );
            resolve("Filename update- successful");
            return;
          }

          console.log(
            `${sessionID}: file:${fileID} was not found- no rename operation done`
          );
          resolve("fileid not found");
          return;
        }
      );
    } catch (err) {
      console.error(err);
      resolve("Database error occured");
      return;
    }
  });
}

async function DeleteFileInformation(sessionID, fileID) {
  let userinformation = await UserExistSessionID(sessionID);
  if (userinformation == undefined) {
    return "SessionID does not exist";
  }

  let db = await ConnectToDB();
  return new Promise((resolve, reject) => {
    try {
      if (db != undefined) {
        //Get file information

        db.all(
          `SELECT fileinformation.filetoken FROM fileinformation WHERE fileid = '${fileID}'`,
          (err, result) => {
            if (err) throw err;
            console.log(result);

            db.run(
              `DELETE FROM fileinformation WHERE fileid = ${fileID}`,
              async function (err) {
                if (err) throw err;
                //Has file been deleted
                if (this.changes > 0) {
                  //send directoryname and filetoken
                  let response = JSON.stringify({
                    directoryname: userinformation.directory,
                    filetoken: result,
                  });
                  console.log(response)
                  console.log(fileID , "File deleted")
                  resolve(response);
                  return;
                }
                db.close();
                console.log("File doesn't exist")
                resolve("File doesn't exist");
                return;
              }
            );
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  });
}

/*
async function DeleteFileInformation(sessionID, fileID) {
  //Get userinformation from db
  let userinformation = await UserExistSessionID(sessionID);
  if (userinformation == undefined) {
    return "SessionID does not exist";
  }

  let db = await ConnectToDB();
  return new Promise(async (resolve, reject) => {
    try {
      if (db != undefined) {
        //Get file information
        db.serialize(async () => {
          db.each(
            `SELECT fileinformation.filetoken FROM fileinformation WHERE fileid = '${fileID}'`,
            async (err, result) => {
              if (err) throw err;

              db.run(
                `DELETE FROM fileinformation WHERE fileid = ${fileID}`,
                async function (err) {
                  if (err) throw err;
                  //Has file been deleted
                  if (this.changes > 0) {
                    //send directoryname and filetoken
                    let response = JSON.stringify({
                      directoryname: userinformation.directory,
                      filetoken: result,
                    });
                    resolve(response);
                    return;
                  }
                  db.close();
                  resolve("File doesn't exist");
                  return;
                }
              );
            }
          );
        });
      }
    } catch (err) {
      console.error(err);
    }
  });
}
*/

module.exports = {
  CreateUser,
  UserExist,
  UserExistObject,
  AddUserToken,
  GetFileInformation,
  AddFileInformation,
  UserExistSessionID,
  RenameFileInformation,
  DeleteFileInformation,
};
