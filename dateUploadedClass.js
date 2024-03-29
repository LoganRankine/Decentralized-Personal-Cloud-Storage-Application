async function dateUploaded(connection,req,res){
    const r_username = req.body.user
    const r_filename = req.body.filename
    const r_dateuploaded = req.body.dateuploaded
    const r_fileType = req.body.filetype
  
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
}
module.exports = {dateUploaded}