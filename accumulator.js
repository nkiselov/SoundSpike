class FeatureAccumulator{

    constructor(chc, count, noiseLvl, simp, tau, learn_rate){
        this.chc = chc
        this.count = count
        this.noiseLvl = noiseLvl
        this.simp = simp
        this.tau = tau
        this.learn_rate = learn_rate
        this.features = []
    }

    processSpikes(spks){
        this.deleted = 0
        this.added = 0
        let rates = new Array(this.chc).fill(0)
        let bestClass = new Array(spks.length).fill(-1)
        for(let i=0; i<spks.length; i++){
            for(let j=0; j<this.chc; j++){
                rates[j]+=spks[i][j]
                rates[j]-=rates[j]*1/16000/this.tau
            }
            if(sqmag(rates)<this.noiseLvl){
                continue
            }
            let nrates = normalize(rates)
            let mags = new Array(this.features.length).fill(0)
            for(let j=0; j<this.features.length; j++){
                for(let k=0; k<this.chc; k++){
                    let df = nrates[k]-this.features[j][0][k]
                    mags[j]+=df*df
                }
            }
            let mnind = 0
            for(let j=0; j<this.features.length; j++){
                if(mags[j]<mags[mnind]) mnind=j
            }
            if(this.features.length==0 || mags[mnind]>this.simp){
                mnind = this.features.length
                mags.push(0)
                this.features.push([nrates,1])
                this.added += 1
            }
            bestClass[i] = mnind
            for(let k=0; k<this.chc; k++){
                this.features[mnind][0][k]+=this.learn_rate*(nrates[k]-this.features[mnind][0][k])
            }
            this.features[mnind][0] = normalize(this.features[mnind][0])

        }
        let ranges = []
        let prev = bestClass[0]
        let last = 0
        for(let i=0; i<spks.length; i++){
            if(prev!=bestClass[i]){
                ranges.push({
                    symbol: prev,
                    start: last,
                    end: i
                })
                last=i
                prev=bestClass[i]
            }
        }
        ranges.push({
            symbol: prev,
            start: last,
            end: spks.length
        })
        return ranges
    }
}