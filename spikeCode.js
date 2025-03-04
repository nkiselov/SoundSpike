let rfSettingPreset = [
    {
        ord: 0,
        lf: 50,
        hf: 5000,
        n: 50,
        tau: 0.01,
        uth: 0.15
    },
    {
        ord: 1,
        lf: 50,
        hf: 5000,
        n: 30,
        tau: 0.001,
        uth: 0.5
    },
    {
        ord: 2,
        lf: 50,
        hf: 5000,
        n: 30,
        tau: 0.001,
        uth: 6
    },
    {
        ord: 3,
        lf: 50,
        hf: 5000,
        n: 30,
        tau: 0.001,
        uth: 80
    }
]

function makeRFSettings(onsettings){
    let settings = {
        ord: 0,
        lf: 50,
        hf: 5000,
        n: 50,
        tau: 0.01,
        uth: 0.15
    }
    onsettings(settings)
    let inputs = {
        ord: makeInput("Order",settings.ord,val=>{settings.ord=val; onsettings(settings)}),
        lf: makeInput("Low",settings.lf,val=>{settings.lf=val; onsettings(settings)}),
        hf: makeInput("High",settings.hf,val=>{settings.hf=val; onsettings(settings)}),
        n: makeInput("Num",settings.n,val=>{settings.n=val; onsettings(settings)}),
        tau: makeInput("Tau",settings.tau,val=>{settings.tau=val; onsettings(settings)}),
        uth: makeInput("Uth",settings.uth,val=>{settings.uth=val; onsettings(settings)})
    }
    return {
        html: makevbox([
            ...Object.values(inputs).map(el=>el.html)
        ]),
        setPreset: (i)=>{
            settings = rfSettingPreset[i]
            Object.keys(settings).forEach(el => {
                inputs[el].setValue(settings[el])
            });
            onsettings(settings)
        }
    }
}

function choose(n,m){
    if(m<0 || m>n || n<0) return 0
    if(2*m<n) return choose(n,n-m)
    let ans = 1
    for(let i=m+1; i<=n; i++) ans*=i
    for(let i=2; i<=n-m; i++) ans/=i
    return ans
}

let chos = [...Array(10).keys()].map(i=>[...Array(i+1).keys()].map(j=>choose(i,j)))

//10641
function makeRFCore(ord,f,t,dt,uth){
    let us = Array(ord+1).fill(0)
    let vs = Array(ord+1).fill(0)
    let lct = Math.cos(Math.PI*2*f*dt)*Math.exp(-dt/t)
    let lst = Math.sin(Math.PI*2*f*dt)*Math.exp(-dt/t)
    let mul = 0
    let mulDec = Math.exp(-dt*f/10)
    return {
        process: (inp)=>{
            let oldv = vs[ord]
            for(let i=ord; i>0; i--){
                for(let j=0; j<i; j++){
                    us[i]+=us[j]*chos[i][j]
                    vs[i]+=vs[j]*chos[i][j]
                }
            }
            for(let i=0; i<=ord; i++){
                let nu = lct*us[i] - lst*vs[i] + (i==0 ? inp : 0)
                let nv = lct*vs[i] + lst*us[i]
                us[i] = nu
                vs[i] = nv
            }
            let fire = us[ord]>uth*(1+mul) && vs[ord]>=0 && oldv<0
            let ret = 0
            if(fire){
                //1+mul optional
                ret=1//+mul
                mul+=10
                for(let i=0; i<=ord; i++){
                    us[i] = 0
                    vs[i] = 0
                }
            }
            mul*=mulDec
            return ret
        },//11560
        reset: ()=>{
            u=0
            v=0
        }
    }
}

function addRFKernel(arr,ord,f,t,dt,m,i,tol){
    let lmul = 0
    for(let j=i; j>=0; j--){
        let di = i-j
        let mul = m*Math.exp(-dt/t*di)*Math.pow(di,ord)
        if(mul<lmul && mul<tol) return
        lmul = mul
        arr[j]+=mul*Math.sin(Math.PI*2*f*dt*di)
    }
}

//lf,hf,n,tau
function makeRFCodec(settings){
    let rf_params = [...Array(settings.n).keys()].map(i=>{
        return [settings.ord,Math.exp(Math.log(settings.hf/settings.lf)*i/settings.n+Math.log(settings.lf)),settings.tau,1/16000,settings.uth]
    })
    let rf_cores = rf_params.map(pr=>makeRFCore(...pr))
    return {
        encode: audio=>{
            let spks = new Array(audio.length).fill(0).map(()=>new Array(settings.n).fill(0))
            for(let j=0; j<settings.n; j++) rf_cores[j].reset()
            for(let i=0; i<audio.length; i++){
                for(let j=0; j<settings.n; j++){
                    spks[i][j] = rf_cores[j].process(audio[i])
                }
            }
            return spks
        },
        decode: spikes=>{
            let output = new Array(spikes.length).fill(0)
            for(let i=0; i<spikes.length; i++){
                for(let j=0; j<settings.n; j++){
                    if(spikes[i][j]>0)
                    addRFKernel(output,...rf_params[j],i,0.001)
                }
            }
            return output
        }
    }
}

function makeRFAutoCodec(n=30,lf=60,hf=6000,utl=1,uth=400,tss=30,tau=0.001){
    return {
        encode: audio=>{
            let time = audio.length/16000
            let spks = new Array(audio.length).fill(0).map(()=>new Array(n).fill(0))
            let ths = new Array(n).fill(0)
            for(let i=0; i<n; i++){
                let f = Math.exp(Math.log(hf/lf)*i/n+Math.log(lf))
                let ul = utl
                let uh = uth
                let m = ul
                while(uh/ul-1>0.1){
                    m = Math.sqrt(ul*uh)
                    let core = makeRFCore(3,f,tau,1/16000,m)
                    let sum = 0
                    for(let j=0; j<audio.length; j++){
                        spks[j][i] = core.process(audio[j])
                        sum+=spks[j][i]>0 ? 1 : 0
                    }
                    if(sum<=time*tss) uh=m
                    else ul=m
                }
                ths[i] = m
            }
            return [spks, ths]
        },
        decode: (spikes,ths)=>{
            let output = new Array(spikes.length).fill(0)
            for(let j=0; j<n; j++){
                let f = Math.exp(Math.log(hf/lf)*j/n+Math.log(lf))
                for(let i=0; i<spikes.length; i++){
                    if(spikes[i][j]>0) addRFKernel(output,3,f,tau,1/16000,spikes[i][j]*ths[j],i,0.001)
                }
            }
            return output
        }
    }
}