//load files

var fileshow = document.getElementById("files")
var file = document.createElement('a')
file.className = "column"
var filename = document.createElement('label')
filename.className = "imageName file"
filename.innerText = "LoganTest"

file.appendChild(filename)
fileshow.appendChild(file)

