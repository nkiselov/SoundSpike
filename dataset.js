(function(root, factory) {
    root.timit = factory.call(root);
}(this, function() {

async function loadDataset(){
    let res = await fetch("/TIMIT/train_data.csv").then(res => res.text())
    let lines = res.split("\r\n")
    let labels = lines[0].split(",")
    let entries = lines.slice(1).map((str)=>{
        let obj = {}
        str.split(",").forEach((e,i)=>{
            obj[labels[i]] = e
        })
        return obj
    })
    entries = entries.filter((obj)=>obj.dialect_region=="DR7")
    let samples = {}
    entries.forEach((obj)=>{
        let path = obj.path_from_data_dir
        let id = path.slice(0,path.indexOf("."))
        let type = path.slice(path.indexOf(".")+1)
        if(samples[id]==null) samples[id] = {}
        fullPath="/TIMIT/data/"+path
        if(type=="PHN"){
            samples[id].phonetic = fullPath
        }
        if(type=="WAV.wav"){
            samples[id].audio = fullPath
        }
        if(type=="TXT"){
            samples[id].sentence = fullPath
        }
        if(type=="WRD"){
            samples[id].word = fullPath
        }
        samples[id].id = id
    })
    return Object.values(samples);
}

async function readSample(sample){
    let audioData = await fetch(sample.audio).then(res => res.arrayBuffer()).catch(err=>console.error(err))
    console.log(audioData)
    let audioCtx = new AudioContext({sampleRate:16000});
    let decodedData = await audioCtx.decodeAudioData(audioData);

    let phonData = await fetch(sample.phonetic).then(res => res.text()).catch(err=>console.error(err))
    
    let phonArr = phonData.trim().split("\n").map((str)=>{
        let sp = str.split(" ")
        return {
            start: parseInt(sp[0]),
            end: parseInt(sp[1]),
            symbol: sp[2]
        }
    })

    let wordData = await fetch(sample.word).then(res => res.text()).catch(err=>console.error(err))
    let wordArr = wordData.trim().split("\n").map((str)=>{
        let sp = str.split(" ")
        return {
            start: parseInt(sp[0]),
            end: parseInt(sp[1]),
            symbol: sp[2]
        }
    })

    let sentenceData = await fetch(sample.sentence).then(res => res.text()).catch(err=>console.error(err))
    
    let sentenceArr = sentenceData.trim().split(" ")

    return {
        audio: decodedData.getChannelData(0),
        phonetic: phonArr,
        word: wordArr,
        sentence: {
            start: parseInt(sentenceArr[0]),
            end: parseInt(sentenceArr[1]),
            symbol: sentenceArr.slice(2).join(" ")
        }
    }
}

return {
    loadDataset: loadDataset,
    readSample: readSample
}
}))