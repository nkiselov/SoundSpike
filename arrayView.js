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