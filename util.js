function downloadTextFile(data, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([data], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

function readTextFile(fileName){
    return fetch(fileName)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    });
}

function readSampleFolder(url){
  return fetch(url+"/feature.json")
  .then(resp=>{
    return resp.json()
  }).then(obj=>{
    return {
      img: url+"/visualization.png",
      audio: url+"/audio.wav",
      feature: obj,
      name: url
    }
  })
}