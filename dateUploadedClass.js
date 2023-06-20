const database_access = require("./Database/MyDataCRUD.js");

async function dateUploaded(req, res, sessionID) {

  var userInformation = await database_access.UserExistSessionID(sessionID)

  const fileInformation = req.body

  //get information to add
  if(userInformation != undefined){

    database_access.AddFileInformation(fileInformation, userInformation)
    //provide userID, filename, uploadDate, file type
  }

  /*
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
          res.end()
        })
      })
    })
    */
}
module.exports = { dateUploaded };
