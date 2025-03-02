function sumArr(arr){
    return arr.reduce((sm, a) => sm+a, 0)
}

function maxArr(arr){
    return arr.reduce((sm, a) => Math.max(sm,a), 0)
}

function arrNorm(arr){
    return Math.sqrt(arr.reduce((sm, a) => sm+a*a, 0))
}

function eyeMatrix(size,val=1){
    return [...Array(size).keys()].map((ind1)=>[...Array(size).keys()].map((ind2)=>ind1==ind2?val:0))
}

function sameMatrix(n,m,val){
    return new Array(n).fill(0).map(()=>new Array(m).fill(val))
}

function randMatrix(n,m,min,max){
    return new Array(n).fill(0).map(()=>new Array(m).fill(0).map(()=>Math.random()*(max-min)+min))
}

function sqmag(arr){
    return Math.sqrt(arr.reduce((sm, a) => sm+a*a, 0))
}

function normalize(arr){
    let sq = sqmag(arr)
    return arr.map(v=>v/sq)
}

function weights2map(weights,wPre,hPre,wPost,hPost){
    let res = new Array(wPre*hPre*wPost*hPost).fill(0)
    for(let x1=0; x1<wPre; x1++){
        for(let y1=0; y1<hPre; y1++){
            for(let x2=0; x2<wPost; x2++){
                for(let y2=0; y2<hPost; y2++){
                    let x = x1+x2*wPre
                    let y = y1+y2*hPre
                    res[hPre*hPost*x+y] = weights[x1+y1*wPre][x2+y2*wPost]
                }
            }
        }
    }
    return res
}

function putInBins(arr,binSize){
    let bins = new Array(Math.floor(arr.length/binSize)+1).fill(0)
    for(let i=0; i<arr.length; i++){
        bins[Math.floor(i/binSize)]+=arr[i]
    }
    return bins
}

function transpose(arr){
    let w = arr.length
    let h = arr[0].length
    let narr = new Array(h).fill(0).map(()=>new Array(w).fill(0))
    for(let i=0; i<w; i++){
        for(let j=0; j<h; j++){
            narr[j][i] = arr[i][j]
        }
    }
    return narr
}

function correlation(x, y) {
    // Validate input arrays
    if (x.length !== y.length || x.length === 0) {
        throw new Error('Arrays must be of equal non-zero length');
    }

    // Calculate means
    const meanX = 0//x.reduce((a, b) => a + b) / x.length;
    const meanY = 0//y.reduce((a, b) => a + b) / y.length;

    // Calculate covariance and standard deviations
    let covariance = 0;
    let varX = 0;
    let varY = 0;

    for (let i = 0; i < x.length; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        
        covariance += diffX * diffY;
        varX += diffX * diffX;
        varY += diffY * diffY;
    }

    // Prevent division by zero
    if (varX === 0 || varY === 0) {
        return 0;
    }

    // Calculate Pearson correlation coefficient
    return covariance / (Math.sqrt(varX) * Math.sqrt(varY));
}