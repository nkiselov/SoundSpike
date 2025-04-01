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