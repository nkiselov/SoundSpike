function makeArrayView(width, height){
    let container = document.createElement("div")
    let label = document.createElement("h")
    let canvas = document.createElement("canvas")

    container.className = 'vbox'
    container.style = 'align-items: center;'
    container.appendChild(canvas)

    canvas.width = width
    canvas.height = height
    canvas.style.width = "100%"
    let ctx = canvas.getContext('2d')

    return {
        html: container,
        setArray: (arr)=>{
            let data = new Uint8ClampedArray(4*width*height)
            for(let ind = 0; ind<width*height; ind++){
                data[4*ind] = 255*arr[ind];
                data[4*ind+1] = 255*arr[ind];
                data[4*ind+2] = 255*arr[ind];
                data[4*ind+3] = 255;
            }
            let img = new ImageData(data,width,height)
            ctx.putImageData(img,0,0)
        }
    }
}

function makeArrayViewIntervals(width, height){
    let container = document.createElement("div")
    let canvas = document.createElement("canvas")

    container.className = 'vbox'
    container.style = 'align-items: center;'
    container.appendChild(canvas)

    canvas.width = width
    canvas.height = height
    canvas.style.width = "100%"
    let ctx = canvas.getContext('2d')

    return {
        html: container,
        setArray: (arr)=>{
            let data = new Uint8ClampedArray(4*width*height)
            for(let ind = 0; ind<width*height; ind++){
                if(arr[ind] == -1){
                    data[4*ind] = 255;
                }
                if(arr[ind] == 1){
                    data[4*ind+2] = 255;
                }
                data[4*ind+3] = 255;
            }
            let img = new ImageData(data,width,height)
            ctx.putImageData(img,0,0)
        }
    }
}

function makeArrayViewIntervalsGallery(name,width,height,arrs,n){
    // shuffleArr(arrs)
    let tables = Array(n).fill(0).map(()=>makeArrayViewIntervals(width,height))
    let input = makeInput("<b>"+name+"</b>",0,val=>{
        let start = Math.max(n*val,0)
        let end = Math.min(arrs.length,n*val+n)
        for(let i=0; i<n; i++){
            if(start+i<end){
                tables[i].html.style.display="block"
                tables[i].setArray(arrs[start+i])
            }else{
                tables[i].html.style.display="none"
            }
        }
    })
    let res = makehbox(tables.map(tbl=>makevbox([tbl.html])))
    res.style.justifyContent="center"
    res.style.gap="10px"
    return makevbox([makehbox([input.html,makeh(arrs.length+"/"+n)]),res])
}

function heatMapColorforValue(value){
    var h = (1.0 - value) * 240
    return "hsl("+h+", 86.70%, 44.30%)";
  }

function makeColorMeshView() {
    const canvas = document.createElement('canvas');
    let sim_text = makeh()
    return {
        html: makevbox([canvas,sim_text]),
        setArray: arr=>{
            
            const ctx = canvas.getContext('2d');
            const rows = arr.length;
            const cols = arr[0].length;
            canvas.width = cols*10;
            canvas.height = rows*10;
            canvas.style.width = cols*6
            canvas.style.height = rows*6
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / rows;

            let dp = Array(rows).fill(0).map(()=>Array(cols).fill(0))
            let from = Array(rows).fill(0).map(()=>Array(cols).fill(0))
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let prev = 0
                    if(i>0 && dp[i-1][j]>prev){
                        prev = dp[i-1][j]
                        from[i][j] = 1
                    }
                    if(j>0 && dp[i][j-1]>prev){
                        prev = dp[i][j-1]
                        from[i][j] = 2
                    }
                    dp[i][j] = prev+arr[i][j]
                }
            }
            sim_text.innerHTML = (100*dp[rows-1][cols-1]/(rows+cols-1)).toFixed(2)+"%"
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                  ctx.fillStyle = heatMapColorforValue(arr[i][j])
                  ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
                }
            }
            ctx.lineWidth = 2
            ctx.strokeStyle = 'rgb(0,0,0)'
            ctx.beginPath();
            let ci = rows-1
            let cj = cols-1
            for(let it=0; it<rows+cols-1; it++){
                ctx.moveTo(cellWidth*cj,cellHeight*ci)
                if(from[ci][cj]==1){
                    ci-=1
                }
                if(from[ci][cj]==2){
                    cj-=1
                }
                ctx.lineTo(cellWidth*cj,cellHeight*ci)
            }
            ctx.stroke();
        }
    }
  }