let username 
let password
let comfirm_password

function ValidateInput(){

  //Get inputted values

  username = document.getElementById("username").value
  password = document.getElementById("password").value
  comfirm_password = document.getElementById("comfirm_password").value

  //Ensure passwords match
  if(password == comfirm_password){

    sendValidation()

    return
  }  

  // passwords dont match
  let error = document.getElementById("dialog")
  error.hidden = false
  error.innerHTML = "Passwords don't match"

}

function sendValidation(){
  //Send request to server containing information
  info = JSON.stringify({
    'username' : username,
    'password' : password,
    'comfirm_password': comfirm_password
  })
  var url = new URL("/createAccount")
  var serverValidate = fetch({method: 'POST', headers:{
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Content-Length': info.length
    },
    body: info})

  if(serverValidate.ok){
    return
  }

  // passwords dont match
  let error = document.getElementById("dialog")
  error.hidden = false
  error.innerHTML = "Username exists"

}