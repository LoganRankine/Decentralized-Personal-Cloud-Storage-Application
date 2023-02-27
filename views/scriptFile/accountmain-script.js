

console.log('Script is read by browser!')

async function DisplayPreview(ImageURL){
    var url = new URL('http://'+ ImageURL + '/0')
    console.log(url.hostname)
    console.log(url.pathname)
    var file = await fetch(url,{mode:'cors', referrerPolicy:'no-referrer'})
    var fileBlob = await file.blob()

    var splittype = fileBlob.type.split('/')
    if(splittype[0] == 'video' || splittype[0] == 'image'){
        var fileURL = URL.createObjectURL(fileBlob)

        var link = document.createElement('a')
        link.href = fileURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link) 
    }
    
}



async function fileSelect(){
    console.log('Upload button pressed')
}

async function m_delete(image_URL, p_name){
    var url = new URL('http://'+ image_URL + '/1')
    var file = await fetch(url,{referrerPolicy:'no-referrer'})
    if(file.ok){
        alert(p_name + ': Deleted, refreshing')
        location.reload()
    }
}

async function download(image_URL, name){
    var url = new URL('http://'+ image_URL + '/0')
    console.log(url.hostname)
    console.log(url.pathname)
    var file = await fetch(url,{mode:'cors', referrerPolicy:'no-referrer'})
    var fileBlob = await file.blob()
    var fileURL = URL.createObjectURL(fileBlob)

    var link = document.createElement('a')
    link.href = fileURL
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)    
}

async function myFunction(id){
    var popup = document.getElementById("myPopDownload" + id);
    var popup1 = document.getElementById("myPopDelete" + id);
    popup.classList.toggle("show");
    popup1.classList.toggle("show")
}

async function select(ImageURL, id, imagename,location, userToken, fileToken){
    var select = "select-action" + id
    var selectedOption = document.getElementById(select).value;
    if(selectedOption == 'download')
    {
        await download(ImageURL,imagename)
    }
    else if(selectedOption == 'delete'){
        await m_delete(ImageURL,imagename)
    }
    else if(selectedOption == "rename"){
         showRename(id,location,userToken, fileToken)
    }
    console.log('Selected option ' + selectedOption)
}

async function showRename(id, location,userToken, fileToken){
    var renamebox = document.getElementById("rename-dialog" + id)
    var renameinput = document.getElementById("rename-input" + id)
    var cancel = document.getElementById("rename-cancel" + id)
    var enter = document.getElementById("rename-button" + id)
    renamebox.showModal()
    cancel.addEventListener('click',(e)=>{
        renamebox.close()
    })
    enter.addEventListener('click',async (e)=>{
        var input_value = renameinput.value
        console.log('inputted', input_value)

        if(input_value.charAt(0) == '.'){
            console.log('cannot start with .')
        }
        else{
            
            //var url = new URL()
            info = JSON.stringify({
                'user' : userToken,
                'file' : fileToken,
                'rename': input_value
            })

            var url = new URL('http://'+ location + 'rename/')
          
            var file = await fetch(url,{mode:'cors', method: 'PUT', headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': info.length
            },
            body: info})
            if(file.ok){
                cancel.click()
                location.reload()
            }
        }
        //Check input for unsupported values
    })
}