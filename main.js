timit.loadDataset().then(dataset=>{
console.log(dataset)

let WINDOW_WIDTH = 40
let RFNEURON_COUNT = 30
let CLASSIFIER_COUNT = 100
let ll_pre = 0.01
let ll_post = 0.001

let slideInput = new SlideFireInput(RFNEURON_COUNT,WINDOW_WIDTH)
let excSynapse = new LearningSynapse(WINDOW_WIDTH*RFNEURON_COUNT,CLASSIFIER_COUNT,10,100,ll_pre,ll_post,1,0,30,0.4,1,0.01)
excSynapse.setWeights(randMatrix(WINDOW_WIDTH*RFNEURON_COUNT,CLASSIFIER_COUNT,0,0.3))
let inhibitOther = new InhibitOthers(CLASSIFIER_COUNT)
let inhSynapse = new Synapse(CLASSIFIER_COUNT,CLASSIFIER_COUNT,50,-40,eyeMatrix(CLASSIFIER_COUNT,20))
let lifLayer = new LIFLayer([excSynapse,inhSynapse],CLASSIFIER_COUNT,50,0,10,0.2,100000)

slideInput.outputs = [excSynapse]
inhibitOther.outputs = [inhSynapse]
lifLayer.outputs = [inhibitOther]

let snn = new SNN([slideInput,lifLayer,inhibitOther])

let arrView = makeArrayView(WINDOW_WIDTH*10, RFNEURON_COUNT*10)
let sampleView = makeSampleView()
let selectedSample

let spikeCodec = makeRFAutoCodec(n=RFNEURON_COUNT)

let smplNum = makeInput("Smpl#",0,(v)=>{
    triggerSampleLoad(v)
})
let audioLengthText = makeh("0")
let spikeCount = makeh("0")
let outSpikeCount = makeh("0")
let spikeView = make2DArrayView()
let outSpikeView = make2DArrayView()
let trainEnable = false
let trainToggle = maketoggle(trainEnable,(v)=>trainEnable=v)

function trainExample(){
    if(!trainEnable) return
    let [spks,ths] = spikeCodec.encode(selectedSample.audio)
    let audioLength = selectedSample.audio.length/16000
    audioLengthText.innerHTML = (audioLength).toPrecision(5)
    spikeCount.innerHTML = (sumArr(spks.flat().map(v=>v>0?1:0))/audioLength).toPrecision(5)

    smplNum.setValue(parseInt(smplNum.getValue())+1)
    spikeView.setData(transpose(transpose(spks).map(arr=>putInBins(arr,16))))

    slideInput.setSpikes(spks)
    let outSpikes = new Array(spks.length).fill(0).map(()=>new Array(CLASSIFIER_COUNT).fill(0))
    let oind = 0
    let totalOutSpikes = 0
    while(!slideInput.reach_end()){
        if(oind%2000==0) console.log((100*oind/spks.length).toFixed(0))
        let spikes = snn.run_step()
        outSpikes[oind] = spikes[1]
        oind+=1
        totalOutSpikes+=sumArr(spikes[1])
    }
    
    outSpikeCount.innerHTML = (totalOutSpikes/audioLength).toPrecision(5)
    arrView.setArray(weights2map(excSynapse.weights,RFNEURON_COUNT,WINDOW_WIDTH,10,10).map(v=>v*10))
    outSpikeView.setData(transpose(transpose(outSpikes).map(arr=>putInBins(arr,16))))
}

function triggerSampleLoad(ind){
    timit.readSample(dataset[ind]).then(res=>{
        selectedSample = res
        sampleView.setSample(res)
        trainExample()
    })
}

triggerSampleLoad(0)
arrView.html.style.width = "70%"
let views = makevbox([spikeView.html,outSpikeView.html,arrView.html])
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
        makehbox([makeh("Out Spike/s"),outSpikeCount]),
        makehbox([makeh("Training"),trainToggle.html])
    ]),
    views
])

main.style = "gap: 20px; height:100%"
document.body.appendChild(main)

})