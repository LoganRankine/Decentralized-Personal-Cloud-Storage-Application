const database_access = require("./Database/MyDataCRUD.js");

async function DeleteFile(req, res) {
  let sessionID = req.query["sessionID"];
  let fileID = req.query["fileid"];

  let response = await database_access.DeleteFileInformation(sessionID, fileID);
  response = JSON.stringify(response);
  console.log(response);
  res.json(response)
}

module.exports = { DeleteFile };
