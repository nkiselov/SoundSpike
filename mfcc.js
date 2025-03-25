function mel2hz(x){
    return (Math.exp(x/1125)-1)*700
}

function hz2mel(x){
    return 1125*Math.log(1+x/700)
}

function MFCC(sig){
    let nsig = Array(sig.length-1).fill(0)
    for(let i=0; i<nsig.length; i++){
        nsig[i] = sig[i+1]-sig[i]
    }
    let fftRes = fft.createSpectrogram(nsig)
    let spectr = fftRes.spectrogram
    let freqs = fftRes.freqs
    let times = fftRes.times

    let nfilt = 16
    let high_mel = hz2mel(8000)
    let fs = [...Array(nfilt+2).keys()].map(i=>mel2hz(i/(nfilt+1)*high_mel))
    let bands = spectr.map(sp=>{
        return [...Array(nfilt).keys()].map(i=>{
            let low = fs[i]
            let mid = fs[i+1]
            let high = fs[i+2]
            let res = 0
            let sumw = 0
            for(let k=0; k<sp.length; k++){
                let f = freqs[k]
                let w = Math.min((f-low)/(mid-low),(high-f)/(high-mid))
                if(w>0){
                    res+=w*sp[k]
                    sumw+=w
                }
            }
            return res/sumw*100
        })
    })
    return {
        vecs: bands,
        times: times
    }
}