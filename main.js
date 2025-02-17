timit.loadDataset().then(dataset=>{
console.log(dataset)

let sampleView = makeSampleView()
let selectedSample

timit.readSample(dataset[23]).then(res=>{
    selectedSample = res
    sampleView.setSample(res)
})

let spikeView = make2DArrayView()
let spikeCodec = makeRFAutoCodec()
let reconstructView = makeSampleView()
let spikeCount = makeh("0")
let simPerc = makeh("0")

let views = makevbox([
    sampleView.html,
    spikeView.html,
    reconstructView.html
])
views.style.width="100%"
// let rfSettings = makeRFSettings(settings=>spikeCodec=makeRFCodec(settings))
let main = makehbox([
    makevbox([
        makeInput("Smpl#",20,(v)=>{
            timit.readSample(dataset[v]).then(res=>{
                selectedSample = res
                sampleView.setSample(res)
            })
        }).html,
        // makeDropdown("Codec",["RF0","Gammatone1","Gammatone2","Gammatone3"],(i)=>{
        //     rfSettings.setPreset(i)
        // },2),
        // makeh("Codec values"),
        // rfSettings.html,
        makeButton("Spiketrum",()=>{
            let [spks,ths] = spikeCodec.encode(selectedSample.audio)

            spikeView.setData(transpose(transpose(spks).map(arr=>putInBins(arr,16))))
            spikeCount.innerHTML = "Spk#: "+sumArr(spks.flat().map(v=>v>0?1:0))

            let dec = spikeCodec.decode(spks,ths)
            let decNorm = arrNorm(dec)
            let audNorm = arrNorm(selectedSample.audio)
            reconstructView.setAudio(dec.map(v=>v/decNorm*audNorm))

            simPerc.innerHTML = "Sim%: " + correlation(fft.createSpectrogram(selectedSample.audio).flat(),fft.createSpectrogram(dec).flat())
        }),
        spikeCount,
        simPerc
    ]),
    views
])

main.style = "gap: 20px; height:100%"
document.body.appendChild(main)

})