var username;
var password;
var confirm_password
let publickey

async function ValidateInput() {
  //Get inputted values

  username = document.getElementById("username").value;
  password = document.getElementById("password").value;
  confirm_password = document.getElementById("confirm_password").value;

  //Ensure passwords match
  if (password == confirm_password) {
    //await getencryptionKey().then(sendValidation())
    await sendValidation()

    return;
  }

  // passwords dont match
  var error = document.getElementById("dialog");
  error.hidden = false;
  error.innerHTML = "Passwords don't match";
}

async function getencryptionKey(){

  var url = new URL("http://" + window.location.host + "/getKey")
  let response = await fetch(url, {method: "GET"})

  publickey = await response.text()

  let publicobject = await window.crypto.subtle.importKey(
    "spki",
    publickey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256"
    },
    true,
    ["encrypt"]
  );

  console.log(publickey)
}

async function sendValidation() {

  //Send request to server containing information
  info = JSON.stringify({
    username: username,
    password: password,
    confirm_password: confirm_password,
  });

  var host = window.location.host;
  var url = new URL("http://" + host + "/createAccount");
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
      window.location.replace("http://" + window.location.host);
      return;
    }

    // username exists
    var error = document.getElementById("dialog");
    error.hidden = false;
    error.innerHTML = "Username exists";
  });
}
