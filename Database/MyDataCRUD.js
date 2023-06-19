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

async function CreateUser(username, password, directory) {
  let db = await ConnectToDB();
  if (db != undefined) {
    db.run(
      `INSERT INTO userinformation (username,password,directory) VALUES('${username}','${password}','${directory}')`,
      (err) => {
        if (err) {
          console.log(err);
        }
        console.log(`${username} added into database`);
        db.close();
      }
    );
  }
  db.close();
  return undefined;
}

async function UserExist(username) {
  let db = await ConnectToDB();
  return new Promise((resolve, reject) => {
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
            db.close();
            return;
          }

          reject(false);
          db.close();
          return;
        }
      );
    }
  });
}

async function UserExistObject(username) {
  let db = await ConnectToDB();
  return new Promise((resolve, reject) => {
    if (db != undefined) {
      db.all(
        `SELECT * FROM userinformation WHERE username = '${username}'`,
        (err, result) => {
          if (err) {
            console.error(err);
          }
          console.log(result);
          if (result.length == 1) {
            console.log(username, "exists");
            resolve(result[0]);
            return;
          }

          reject(undefined);
          return;
        }
      );
    }
  });
}

async function AddUserToken(username, token) {
  try {
    let db = await ConnectToDB();
    if (db != undefined) {
      db.run(
        `UPDATE userinformation SET sessionID = '${token}' WHERE username = '${username}'`
      );
      return true
    }
  } catch {
    return false
  }
  return false
}

module.exports = { CreateUser, UserExist, UserExistObject, AddUserToken };
