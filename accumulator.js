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

class SVMAccumulator{

    constructor(svm_features){
        this.svm_features = svm_features
        this.chc = 30
    }

    processSpikes(spks){
        let rates = new Array(this.chc).fill(0)
        let bestClass = new Array(spks.length).fill(-1)
        let wlen = 800
        for(let i=0; i<spks.length; i++){
            for(let j=0; j<this.chc; j++){
                rates[j]+=spks[i][j]
                if(i>=wlen) rates[j]-=spks[i-wlen][j]
            }
            let mevl = 0
            let bind = -1
            for(let c=0; c<this.svm_features.length; c++){
                let evl = this.svm_features[c].beta[this.chc]
                for(let j=0; j<this.chc; j++){
                    evl+=this.svm_features[c].beta[j]*rates[j]
                }
                if(i>0 && c==bestClass[i-1]) evl+=1;
                if(evl>mevl){
                    mevl = evl;
                    bind = c;
                }
            }
            bestClass[i] = bind;
        }
        let ranges = []
        let prev = bestClass[0]
        let last = 0
        for(let i=0; i<spks.length; i++){
            if(prev!=bestClass[i]){
                ranges.push({
                    symbol:  prev==-1?"-1":this.svm_features[prev].label,
                    start: last,
                    end: i
                })
                last=i
                prev=bestClass[i]
            }
        }
        ranges.push({
            symbol: prev==-1?"-1":this.svm_features[prev].label,
            start: last,
            end: spks.length
        })
        return ranges
    }

}