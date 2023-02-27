async function RenameFile(connection, body, userid){
    return new Promise((resolve, reject) => {
    const fileid = body.fileid
    
    const rename = body.name
    const query = "UPDATE `userprofile`.`fileinformation` SET `filename` = '" + rename +"' WHERE (`FileID` = '"+ fileid +"');"
    connection.query(query, async function (err, result, fields){
        if(err){ 
            console.log(err)
            reject(err)
        }
        resolve()
        console.log('file renamed')
    })

    })
    
}

module.exports = {RenameFile}