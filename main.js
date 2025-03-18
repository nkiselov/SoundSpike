Promise.all([
    timit.loadDataset(),
    libsvm,
    readTextFile("models/s-model (6).txt")
]).then(resource=>{
    let dataset = resource[0]
    SVM = resource[1]
    let svm_data = resource[2]

    let sampleView = makeSampleView()
    let selectedSample
    let trainEnable = false
    let trainToggle = maketoggle(trainEnable,(v)=>trainEnable=v)
    let graph = makeGraph(1000,250)
    let reconstructView = make2DArrayViewTranscript()
    let smplNum = makeInput("Smpl#",1,(v)=>{
        timit.readSample(dataset[v]).then(res=>{
            selectedSample = res
            sampleView.setSample(res)
            runExample(trainEnable)
        })
    })
    let learnText = makeh("Learning")
    learnText.style.display = "none"

    let views = makevbox([
        sampleView.html,
        reconstructView.html,
        graph.html
    ])
    views.style.width="100%"

    function makeLabels(times,phon){
        let ph = 0
        let res = Array(times.length).fill(0)
        for(let i=0; i<times.length; i++){
            while(ph+1<phon.length && phon[ph].end<times[i]*16000) ph++;
            res[i] = phon[ph].symbol=="s"?1:0
        }
        return res
    }

    let clasf = new Classifier()
    clasf.svm = SVM.load(svm_data)
    clasf.trained = true
    function runExample(train){
        let res = MFCC(selectedSample.audio)
        reconstructView.setData(res.vecs)
        reconstructView.setTranscript(0,selectedSample.audio.length,selectedSample.phonetic.filter(ph=>ph.symbol=="s"))
        graph.setData(clasf.transcribe(res.vecs).map(v=>Math.max(v,0)))
        if(!train) return
        clasf.addTrainData(res.vecs,makeLabels(res.times,selectedSample.phonetic))
        if(!trainEnable) return
        smplNum.setValue(parseInt(smplNum.getValue())+1)
    }

    let main = makehbox([
        makevbox([
            smplNum.html,
            makeButton("Train",()=>{
                runExample(true)
            }),
            makehbox([makeh("Auto Train"),trainToggle.html]),
            makeButton("Learn",()=>{
                learnText.style.display = "block"
                setTimeout(()=>{
                    clasf.learn()
                    learnText.style.display = "none"
                },10)
            }),
            makeButton("Test",()=>{
                runExample(false)
            }),
            makeButton("Download Model",()=>{
                downloadTextFile(clasf.svm.serializeModel(),"s-model.txt")
            }),
            learnText,
            makeInput("Max",1,val=>graph.setMax(val)).html,
            makeInput("Line",0.7,val=>graph.setLine(val)).html
        ]),
        views
    ])
    
    main.style = "gap: 20px; height:100%"
    document.body.appendChild(main)
})