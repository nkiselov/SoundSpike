function runTemplater(dataset,clasf){
    Promise.all(
        dataset.map(sample=>timit.readSample(sample))
    ).then((samples)=>{
        let mp = new Map()
        for(let i=0; i<samples.length; i++){
            console.log(i)
            let res = MFCC(samples[i].audio)
            let cls = clasf.transform(res.vecs)
            samples[i].phonetic.forEach(ph=>{
                if(!mp.has(ph.symbol)) mp.set(ph.symbol,[])
                let temp = []
                for(let i=0; i<cls.length; i++){
                    let t = res.times[i]*16000
                    if(t<ph.end && t>=ph.start) temp.push(cls[i])
                }
                if(temp.length>0) mp.get(ph.symbol).push(temp)
            })
        }
        downloadTextFile(JSON.stringify(Object.fromEntries(mp)),"templates.json")
    })
}