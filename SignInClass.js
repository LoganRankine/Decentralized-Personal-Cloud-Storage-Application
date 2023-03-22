const bcrypt = require("bcrypt");
const crypto = require('crypto');
const { on } = require("events");

async function UserSignIn(connection,res, user, password, PortNummber,IPaddress) {
  return new Promise((resolve, reject) => {
    let class_user;
    //check if user exists
    connection.query("SELECT * FROM user WHERE username=" + "'" + user + "'", async function (err, result, fields) {
      if (err) throw err;
  
      //checks if anything is recieved back. Most likeley means username doesn't exist
      if (result.length == 0) {
        res.send("Incorrect username or password");
        console.log("Username doesn't exist")
      }
  
      // username exists, checking password
      else {
        var dataRecieved = result[0];
  
        //compares password recieved from user to password recieved from server
        if (await comparePassword(password, dataRecieved.password) == true) {
        
          //Takes user to account and sets their directory
          await GenerateToken(res, dataRecieved.iduser, user).then((on) =>{
            if(on.SessionID != undefined){
              res.redirect('http://' + IPaddress +':' + PortNummber+'/AccountPage')
              resolve(on)
            }
          })
        }
        else {
          res.send("Incorrect username or password");
          console.log('password incorrect')
        }
      }
    });
    //console.log('ignored')
  })
    
  }

  async function comparePassword(password, hash) {
    const result = await bcrypt.compare(password, hash);
    return result;
  }

  async function GenerateToken(res, id, name){
    //Generate random string to be used as cookie token
    const newUserToken = crypto.randomBytes(20).toString('base64url')
    
    //Cookie options
    const options = {
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      httpOnly: true, // The cookie only accessible by the web server
    }
    //set cookie
    res.cookie('SessionID', newUserToken, options)
  
    const user = {SessionID: newUserToken, UserID: id, UserName: name}
  
    return user;
    //res.cookie('userID', dataRecieved.iduser, options)
    //res.cookie('userName', dataRecieved.username,options)
  }

  async function UserToken(){
    return class_user
  }

module.exports = {UserSignIn}

 /*
  module.exports = {async constructor(connection,res, user, password, PortNummber,IPaddress){
    let p_user = await UserSignIn(connection,res, user, password, PortNummber,IPaddress).then((on)=>{
        if(on != undefined){
            return p_user
        }
    })
}};
*/