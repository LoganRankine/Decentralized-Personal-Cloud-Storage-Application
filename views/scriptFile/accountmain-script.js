console.log('Script is read by browser!')

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

async function select(ImageURL, id, imagename){
    var select = "select-action" + id
    var selectedOption = document.getElementById(select).value;
    if(selectedOption == 'download')
    {
        await download(ImageURL,imagename)
    }
    else if(selectedOption == 'delete'){
        await m_delete(ImageURL,imagename)
    }
    console.log('Selected option ' + selectedOption)
}