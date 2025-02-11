function sumArr(arr){
    return arr.reduce((sm, a) => sm+a, 0)
}

function maxArr(arr){
    return arr.reduce((sm, a) => Math.max(sm,a), 0)
}

function arrNorm(arr){
    return Math.sqrt(arr.reduce((sm, a) => sm+a*a, 0))
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