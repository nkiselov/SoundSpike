class vdotClassifier{
    CONFIDENCE = 0.8
    MERGE_CONFIDENCE = 0.9
    MIN_RMS = 0.2
    BIAS_STRENGTH = 0.05
    REWARD = 0.01
    PUNISH = 0.002

    constructor(){
        this.vecs = []
        this.freqs = []
    }

    vecLen(v){
        let len = 0
        v.forEach(x=>len+=x*x)
        return Math.sqrt(len)
    }

    vecMul(c,v){
        return v.map(x=>x*c)
    }

    vecAdd(a,b){
        return a.map((x,i)=>x+b[i])
    }

    vecAngle(a,b){
        let m11 = 0
        let m12 = 0
        let m22 = 0
        for(let j=0; j<a.length; j++){
            m11+=a[j]*a[j]
            m12+=a[j]*b[j]
            m22+=b[j]*b[j]
        }
        return m12/Math.sqrt(m11*m22)
    }

    vecNorm(v){
        return this.vecMul(1/this.vecLen(v),v)
    }

    elevate(v){
        // return [...v,...v.map(x=>x*x)]
        return v
    }

    getSim(v,i){
        return this.vecAngle(this.elevate(v),this.vecs[i])
    }

    checkInput(v){
        return this.vecLen(v)>this.MIN_RMS*v.length
    }

    classify(v,bias){
        if(!this.checkInput(v)) return {type: -1, sim: -Infinity};
        let mxi = -1
        let best = -Infinity
        let ev = this.elevate(v)
        for(let i=0; i<this.vecs.length; i++){
            let sim = this.vecAngle(ev,this.vecs[i])
            if(i==bias) sim+=this.BIAS_STRENGTH;
            if(sim>best){
                mxi = i
                best = sim
            }
        }
        return {type: mxi, sim: best}
    }

    transcribe(inps){
        let types = Array(inps.length).fill(0)
        let prev = -1
        for(let i=0; i<inps.length; i++){
            types[i] = this.classify(inps[i],prev).type
            prev = types[i]
        }
        let trs = []
        let start = 0
        for(let i=0; i<types.length; i++){
            if(i==types.length-1 || types[i+1]!=types[i]){
                if(types[i]>=0)
                trs.push({
                    start: start,
                    end: i+1,
                    symbol: types[i]
                })
                start = i+1
            }
        }
        return trs
    }

    train(vs){
        let prev = -1
        vs.forEach(v=>{
            if(!this.checkInput(v)){
                prev=-1
                return;
            }
            let ev = this.vecNorm(this.elevate(v))
            let simr = this.classify(v,prev)
            if(simr.sim>this.CONFIDENCE){
                let mul = this.REWARD * (simr.sim-this.CONFIDENCE)/(1-this.CONFIDENCE)
                this.vecs[simr.type] = this.vecNorm(this.vecAdd(this.vecs[simr.type],this.vecMul(mul,ev)))
                prev = simr.type
            }else{
                prev = this.vecs.length
                this.vecs.push(this.elevate(v))
                this.freqs.push(0)
            }
            this.freqs[prev]+=1
            for(let i=0; i<this.freqs.length; i++) this.freqs[i]-=0.0001*this.freqs[i]
            // for(let i=0; i<this.vecs.length; i++){
            //     let sim = this.vecAngle(ev,this.vecs[i])
            //     if(i!=prev && sim>this.CONFIDENCE){
            //         let mul = -this.PUNISH * (simr.sim-this.CONFIDENCE)/(1-this.CONFIDENCE)
            //         this.vecs[simr.type] = this.vecNorm(this.vecAdd(this.vecs[simr.type],this.vecMul(mul,ev)))
            //     }
            // }
        })
    }

    simMatrix(){
        let inds = [...Array(this.vecs.length).keys()]
        return inds.map(i=>inds.map(j=>this.vecAngle(this.vecs[i],this.vecs[j])))
    }

    smoothArr(arr){
        let n = arr.length
        let s = 1
        let res = Array(n).fill(0)
        for(let i=0; i<n; i++){
            let sum = 0
            let cnt = 0
            for(let j=Math.max(i-s,0); j<=Math.min(i+s,n-1); j++){
                sum+=arr[j]
                cnt++
            }
            res[i] = sum/cnt
        }
        return res
    }

    transform(inps){
        return transpose(this.vecs.map(v=>this.smoothArr(inps.map(inp=>{
            return Math.max(0,(this.vecAngle(this.elevate(inp),v)-this.CONFIDENCE)/(1-this.CONFIDENCE))
        }))))
    }

    printDesc(){
        let res1 = this.vecs.map((v,i)=>[this.freqs[i],i])
        res1.sort((a,b)=>Math.sign(a[0]-b[0]))
        console.log(res1)
        let res = []
        for(let i1=0; i1<this.vecs.length; i1++){
            for(let i2=i1+1; i2<this.vecs.length; i2++){
                let sim = this.vecAngle(this.vecs[i1],this.vecs[i2])
                if(sim>this.MERGE_CONFIDENCE) res.push([sim,i1,i2])
            }
        }
        res.sort((a,b)=>Math.sign(b[0]-a[0]))
        console.log(res)
    }
}