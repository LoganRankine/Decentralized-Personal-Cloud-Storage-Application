let username 
let password

async function Validate(){
    username = document.getElementById("username").value
    password = document.getElementById("password").value

    if(username != "" && password != ""){
        await sendValidation()
    }

    //
    var error = document.getElementById("dialog");
    error.hidden = false;
    error.innerHTML = "Missing inputs";
    
}

async function sendValidation() {

    //Send request to server containing information
    info = JSON.stringify({
      username: username,
      password: password,

    });
  
    var host = window.location.host;
    var url = new URL("http://" + host + "/signIn");
    var serverValidate = fetch(url, {
      referrerPolicy: "no-referrer",
      mode: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Content-Length": info.length,
      },
      body: info,
    }).then((response) => {
      if (response.ok) {
        window.location.replace("http://" + window.location.host + "/AccountPage");
        return;
      }
  
      // username exists
      var error = document.getElementById("dialog");
      error.hidden = false;
      error.innerHTML = "username or password incorrect";
    });
  }