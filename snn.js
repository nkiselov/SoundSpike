//Each layer must
//  run_spk() = return spike output
//  accept_spk(arr) = accept spike input
//  outputs = a list of outgoing connections

class SNN{
    constructor(layers){
        this.layers = layers
    }

    run_step(){
        let spikes = this.layers.map((layer)=>layer.run_spk())
        this.layers.forEach((layer, ind)=>{
            if(layer.outputs)
            layer.outputs.forEach((out)=>{
                out.accept_spk(spikes[ind])
            })
        })
        return spikes
    }
}


class SlideFireInput{
    constructor(outSize,windowSize){
        this.outSize = outSize
        this.windowSize = windowSize
    }

    setSpikes(spks){
        this.ind = 0
        this.spks = spks
    }

    reach_end(){
        return this.ind+this.windowSize>this.spks.length
    }

    run_spk(){
        let spk = new Array(this.windowSize*this.outSize).fill(0)
        for(let i=0; i<this.windowSize; i++){
            for(let j=0; j<this.outSize; j++){
                spk[this.outSize*i+j] = this.spks[(i+this.ind)%this.spks.length][j]
            }
        }
        this.ind+=1
        return spk
    }

    relax(){
        
    }
}

class LIFLayer{
    constructor(synapses, size, tau, vrest, vt, hv, hv_tau){
        this.synapses = synapses
        this.size = size
        this.volts = new Array(size).fill(0)
        this.hemv = new Array(size).fill(0)
        this.tau = tau
        this.vrest = vrest
        this.vt = vt
        this.hv = hv
        this.hv_tau = hv_tau
    }

    run_spk(){
        for(let s=0; s<this.synapses.length; s++){
            let syn = this.synapses[s]
            for(let i=0; i<this.size; i++){
                this.volts[i]+=(syn.flows[i]*(syn.eqv-this.volts[i]))/this.tau/(1+this.hemv[i])
            }
        }
        let spk = new Array(this.size).fill(0)
        for(let i=0; i<this.size; i++){
            if(this.volts[i]>this.vt){
                this.volts[i] = 0
                spk[i] = 1
                this.hemv[i]+=this.hv
            }else{
                this.volts[i]+=(this.vrest-this.volts[i])/this.tau
            }
            this.hemv[i]-=this.hemv[i]/this.hv_tau
        }
        this.synapses.forEach((syn)=>syn.update(spk))
        return spk
    }

    relax(){
        this.volts = new Array(this.size).fill(0)
    }

    forget(){
        this.relax()
        this.hemv = new Array(this.size).fill(0)
    }
}

//init_weights
//tau = time const
//eqv = equilibrium potential
class Synapse{
    constructor(inp_size, out_size, tau, eqv, init_weights){
        this.inp_size = inp_size
        this.out_size = out_size
        if(init_weights){
            this.weights = init_weights
        }else{
            this.weights = new Array(inp_size).fill(0).map(()=>new Array(out_size).fill(1))
        }
        this.flows = new Array(out_size).fill(0)
        this.tau = tau
        this.eqv = eqv
    }

    setWeights(weights){
        this.weights = weights
    }

    accept_spk(input){
        if(input.length!=this.inp_size){
            console.error("Length error")
        }
        for(let i=0; i<this.inp_size; i++){
            if(input[i]==0) continue;
            for(let j=0; j<this.out_size; j++){
                this.flows[j]+=this.weights[i][j]
            }
        }
    }

    update(){
        for(let i=0; i<this.out_size; i++){
            this.flows[i]-=this.flows[i]/this.tau
        }
    }
    
    relax(){
        this.flows = new Array(this.out_size).fill(0)
    }

    forget(){
        this.relax()
    }
}

class LearningSynapse extends Synapse{

    constructor(inp_size, out_size, tau, eqv, ll_pre, ll_post, mu, x_tar, x_tau, w_max,  w_sums_max, w_sums_eff){
        super(inp_size, out_size, tau, eqv)
        this.ll_pre = ll_pre
        this.ll_post = ll_post
        this.mu = mu
        this.x_tar = x_tar
        this.x_tau = x_tau
        this.x_pre = new Array(inp_size).fill(0)
        this.x_post = new Array(out_size).fill(0)
        this.w_max = w_max
        this.w_sums_max = w_sums_max
        this.w_sums_eff = w_sums_eff
    }

    setWeights(weights){
        super.setWeights(weights)
        this.w_sums = new Array(this.out_size).fill(0)
        for(let i=0; i<this.inp_size; i++){
            for(let j=0; j<this.out_size; j++){
                this.w_sums[j] += this.weights[i][j]
            }
        }
    }

    accept_spk(input){
        super.accept_spk(input)
        for(let i=0; i<this.inp_size; i++){
            if(input[i]>0){
                this.x_pre[i]+=1
                for(let j=0; j<this.out_size; j++){
                    let dw = -this.ll_pre*this.x_post[j]*this.weights[i][j]
                    this.w_sums[j] -= this.weights[i][j]
                    this.weights[i][j]=Math.max(0,this.weights[i][j]+dw)
                    this.w_sums[j] += this.weights[i][j]
                }
            }
            this.x_pre[i]-=this.x_pre[i]/this.x_tau
        }
    }

    update(spks){
        super.update()
        for(let i=0; i<this.out_size; i++){
            if(spks[i]>0){
                this.x_post[i]+=1
                for(let j=0; j<this.inp_size; j++){
                    let dw = this.ll_post*(this.x_pre[j]-this.x_tar)*(this.w_max-this.weights[j][i]) + this.ll_post*(this.w_sums_max-this.w_sums[i])*this.w_sums_eff
                    this.w_sums[i] -= this.weights[j][i]
                    this.weights[j][i]=Math.max(0,this.weights[j][i]+dw)
                    this.w_sums[i] += this.weights[j][i]
                }
            }
            this.x_post[i]-=this.x_post[i]/this.x_tau
        }
    }

    relax(){
        super.relax()
    }

    forget(){
        super.forget()
        this.relax()
        this.x_pre = new Array(this.inp_size).fill(0)
        this.x_post = new Array(this.out_size).fill(0)
    }
}

class InhibitOthers{
    constructor(size){
        this.size = size
        this.out_spk = new Array(size).fill(0)
    }

    accept_spk(input){
        if(input.length!=this.size){
            console.error("Length error")
        }
        let sum = input.reduce((psum, a) => psum + a, 0)
        this.out_spk = input.map((v)=>sum-v)
    }

    run_spk(){
        return this.out_spk
    }
}