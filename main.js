timit.loadDataset().then(dataset=>{
console.log(dataset)

let RFNEURON_COUNT = 30
let CLASSIFIER_COUNT = 100
let arrView = makeArrayView(CLASSIFIER_COUNT, RFNEURON_COUNT)

let accum = new FeatureAccumulator(RFNEURON_COUNT,CLASSIFIER_COUNT,2,0.8,0.05,1e-6)

// let sampleView = makeSampleView()
let selectedSample
let spikeView = make2DArrayViewTranscript()

let spikeCodec = makeRFAutoCodec(n=RFNEURON_COUNT)

let smplNum = makeInput("Smpl#",0,(v)=>{
    triggerSampleLoad(v)
})
let audioLengthText = makeh("0")
let spikeCount = makeh("0")
let outSpikeCount = makeh("0")
let addedCount = makeh("0")
let removedCount = makeh("0")
let totalCount = makeh("0")
let trainEnable = false
let trainToggle = maketoggle(trainEnable,(v)=>trainEnable=v)
let reconstructView = makeSampleView()

function trainExample(){
    if(!trainEnable) return
    let [spks,ths] = spikeCodec.encode(selectedSample.audio)
    let audioLength = selectedSample.audio.length/16000
    audioLengthText.innerHTML = (audioLength).toPrecision(5)
    spikeCount.innerHTML = (sumArr(spks.flat().map(v=>v>0?1:0))/audioLength).toPrecision(5)

    smplNum.setValue(parseInt(smplNum.getValue())+1)
    spikeView.setData(transpose(transpose(spks).map(arr=>putInBins(arr,16))))


    let outLabels = accum.processSpikes(spks)
    let totalOutSpikes = outLabels.length
    spikeView.setTranscript(0,selectedSample.audio.length,selectedSample.phonetic)
    spikeView.setTranscript(1,selectedSample.audio.length,outLabels.map(el=>{
        el.symbol = ''+el.symbol
        return el
    }))
    addedCount.innerHTML = accum.added
    removedCount.innerHTML = accum.deleted
    totalCount.innerHTML = accum.features.length

    outSpikeCount.innerHTML = (totalOutSpikes/audioLength).toPrecision(5)

    let dec = spikeCodec.decode(spks,ths)
    let decNorm = arrNorm(dec)
    let audNorm = arrNorm(selectedSample.audio)
    reconstructView.setAudio(dec.map(v=>v/decNorm*audNorm))
}

function triggerSampleLoad(ind){
    timit.readSample(dataset[ind]).then(res=>{
        selectedSample = res
        // sampleView.setSample(res)
        trainExample()
    })
}

triggerSampleLoad(0)
arrView.html.style.width = "70%"
let views = makevbox([spikeView.html,arrView.html,reconstructView.html])
views.style.width="100%"
let main = makehbox([
    makevbox([
        smplNum.html,
        makeButton("Start",()=>{
            trainToggle.setValue(true)
            trainExample()
        }),
        makeButton("Stop",()=>{
            trainToggle.setValue(false)
        }),
        makehbox([makeh("Length"),audioLengthText]),
        makehbox([makeh("In Spike/s"),spikeCount]),
        makehbox([makeh("Out Type/s"),outSpikeCount]),
        makehbox([makeh("Added"),addedCount]),
        makehbox([makeh("Removed"),removedCount]),
        makehbox([makeh("Total"),totalCount]),
        makehbox([makeh("Training"),trainToggle.html])
    ]),
    views
])

main.style = "gap: 20px; height:100%"
document.body.appendChild(main)

})