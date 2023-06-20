let fileInformation;

GetFileInformation();

//Get files

async function GetFileInformation() {
  //Get sessionID from cook
  var sessionID = document.cookie;
  sessionID = sessionID.replace("SessionID=", "");

  //send request to server to send all file information
  let request = await fetch(
    `http://localhost:3000/getFiles?SessionID=${sessionID}`
  );
  if (request.ok) {
    fileInformation = await request.json();
    console.log("file information retrieved");
    DisplayFiles()
  }
}

async function DisplayFiles() {
  var fileshow = document.getElementById("files");

  fileInformation.forEach((user) => {
    var file = document.createElement("a");
    file.className = "column";

    //Filename
    var filename = document.createElement("label");
    filename.className = "imageName file";
    filename.innerText = user.filename;

    //upload date
    var uploaddate = document.createElement("label");
    filename.className = "dateuploaded";
    filename.innerText = user.uploadDate;

    //file type
    var fileType = document.createElement("label");
    filename.className = "fileType";
    filename.innerText = user.filetype;

    file.appendChild(filename);
    file.appendChild(uploaddate);
    file.appendChild(fileType);
    fileshow.appendChild(file);
  });
}
