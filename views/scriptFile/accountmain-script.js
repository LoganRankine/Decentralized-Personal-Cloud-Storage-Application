console.log('Script is read by browser!')

async function download(image_URL, name){
    const url = new URL('http://'+ image_URL)
    console.log(url.hostname)
    console.log(url.pathname)
    const file = await fetch(url,{mode:'cors', referrerPolicy:'no-referrer'})
    const fileBlob = await file.blob()
    const fileURL = URL.createObjectURL(fileBlob)

    const link = document.createElement('a')
    link.href = fileURL
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)    
}

async function myFunction(id){
    var popup = document.getElementById("myPop" + id);
    popup.classList.toggle("show");
}