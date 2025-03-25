Promise.all([
    timit.loadDataset(),
]).then(resource=>{
    let dataset = resource[0]

    let sampleView = makeSampleView()
    let selectedSample
    let trainEnable = false
    let trainToggle = maketoggle(trainEnable,(v)=>trainEnable=v)
    let graph = makeGraph(1000,250)
    let reconstructView = make2DArrayViewTranscript()
    let smplNum = makeInput("Smpl#",0,(v)=>{
        timit.readSample(dataset[v]).then(res=>{
            selectedSample = res
            sampleView.setSample(res)
            runExample(trainEnable)
        })
    })
    let learnText = makeh("Learning")
    let countText = makeh("Features: 0")
    learnText.style.display = "none"
    let graphType = -1
    let simView = make2DArrayView()
    let transformView = make2DArrayView()

    let views = makevbox([
        sampleView.html,
        reconstructView.html,
        // makehbox([simView.html])
        // graph.html
        transformView.html
    ])
    views.style.width="100%"

    let clasf = new vdotClassifier()

    function runExample(train){
        let res = MFCC(selectedSample.audio)
        reconstructView.setData(res.vecs)
        reconstructView.setTranscript(0,res.vecs.length,clasf.transcribe(res.vecs))
        if(graphType>=0 && graphType<clasf.vecs.length)
        graph.setData(res.vecs.map(v=>clasf.getSim(v,graphType)))
        if(train){
            clasf.train(res.vecs)
            if(trainEnable) smplNum.setValue(parseInt(smplNum.getValue())+1)
        }
        transformView.setData(clasf.transform(res.vecs))
        // simView.setData(clasf.simMatrix())
        countText.innerHTML = "Features: "+clasf.vecs.length
    }

    let main = makehbox([
        makevbox([
            smplNum.html,
            makeButton("Train",()=>{
                runExample(true)
            }),
            makehbox([makeh("Auto Train"),trainToggle.html]),
            learnText,
            makeInput("Type (graph)",0,(v)=>{
                graphType=v
                if(selectedSample) runExample(false)
            }).html,
            makeButton("Print", ()=>clasf.printDesc()),
            countText,
            makeButton("Run Templater", ()=>runTemplater(dataset,clasf))
        ]),
        views
    ])
    
    main.style = "gap: 20px; height:100%"
    document.body.appendChild(main)
})