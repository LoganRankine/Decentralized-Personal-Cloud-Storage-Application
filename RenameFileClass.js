const database_access = require("./Database/MyDataCRUD.js");

async function RenameFile(req, res) {
  return new Promise(async (resolve, reject) => {
    //Get request ID
    let sessionID = req.query["sessionID"];

    //Information to change filename
    let fileID = req.query["fileid"];
    let NewFilename = req.body.newFilename;

    //Send response
    res.send(await database_access.RenameFileInformation(sessionID, fileID, NewFilename))
    resolve()
  });
}

module.exports = { RenameFile };
