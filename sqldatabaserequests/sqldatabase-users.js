var mysql = require('mysql');

var userProfiles;

var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "userprofile"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected");

    connection.query("SELECT * FROM user", function (err, result, fields) {
        if (err) throw err;
        userProfiles = result;
        console.log(result);
      });
});

// Check if username and password exists
function UserValidation(user, password){

    

}
