let input;
let username;
let password;
let confirm_password;

var fs = require('fs');

const check_input = document.querySelector("#create");
check_input.addEventListener("click", function() {
    //get inputs recieved from user
    console.log("inputs recieved")
    username = document.querySelector('#username-input').ariaValueMax
    password = document.querySelector('#password-input')
    confirm_password = document.querySelector('#confirm-input')

    fs.appendFile('mynewfile1.txt', username, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

})