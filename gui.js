function makeButton(label, onclick){
    let button = document.createElement("button")
    button.onclick = onclick
    button.innerHTML = label
    return button
}

function makehbox(elems){
    let hbox = document.createElement("div")
    hbox.className = "hbox"
    elems.forEach((e)=>hbox.appendChild(e))
    return hbox
}

function makevbox(elems){
    let vbox = document.createElement("div")
    vbox.className = "vbox"
    elems.forEach((e)=>vbox.appendChild(e))
    return vbox
}

function makeh(text){
    let h = document.createElement("h")
    h.innerHTML = text
    return h
}

function maketoggle(checked, onchange){
    let tog = document.createElement("input")
    tog.type = "checkbox"
    tog.checked = checked
    tog.onchange = ()=>onchange(tog.checked)
    return {
        html: tog,
        setValue: val=>{
            tog.checked=val
            onchange(val)
        },
        getValue: ()=>{
            return tog.checked
        }
    }
}

function makeInput(label,value,onchange){
    let inp = document.createElement("input")
    inp.type = "number"
    inp.value = value
    inp.onchange = ()=>onchange(parseFloat(inp.value))
    let text = document.createElement("h")
    text.innerHTML=label
    let cont = document.createElement("div")
    cont.className = "hbox"
    cont.appendChild(text)
    cont.appendChild(inp)
    onchange(value)
    return {
        html: cont,
        setValue: val=>{
            inp.value = val
            onchange(val)
        },
        getValue: ()=>{
            return inp.value
        }
    }
}

function makeFileInput(label,onfile){
    let inp = document.createElement("input")
    inp.type = "file"
    inp.style = "display: none"
    inp.accept = ".json"
    inp.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    onfile(JSON.parse(e.target.result))
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    alert('Error parsing JSON file. Please make sure it\'s a valid JSON file.');
                }
            };

            reader.onerror = function(e) {
                console.error('Error reading file:', e);
                alert('Error reading file');
            };

            reader.readAsText(file);
        }
    });
    let btn = makeButton(label,()=>inp.click())
    return btn
}

function makeKeyDown(elem, callback) {
    elem.addEventListener('mousedown', e => {
        const rect = elem.getBoundingClientRect();
        
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        
        callback(x, y);
    });
}

function makeDropdown(label, options, onchange, ind=0) {
    const select = document.createElement("select");
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.text = opt;
      select.appendChild(option);
    });
    select.onchange = () => onchange(select.selectedIndex)
    select.selectedIndex = ind
    onchange(select.selectedIndex)
    const text = document.createElement("h");
    text.innerHTML = label;
  
    const cont = document.createElement("div");
    cont.className = "hbox";
    cont.appendChild(text);
    cont.appendChild(select);
    return cont;
}

function makeGraph(width = 300, height = 150) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    canvas.style = "width: 100%;aspect-ratio: unset;height: 250px;"
    
    let data = [];
    
    let gMax = 1
    let gLine = 0.7
    function draw() {
        if (data.length === 0) return;
        
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = "#0066cc";
        ctx.lineWidth = 2;
        
        const max = gMax
        const min = 0;
        const range = max - min || 1;
        
        ctx.beginPath();
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * (height - 20);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        ctx.strokeStyle = "#888888"
        ctx.beginPath();
        ctx.moveTo(0,height-height*gLine/max)
        ctx.lineTo(width,height-height*gLine/max)
        ctx.stroke()
    }
    
    return {
        html: canvas,
        setData: (newData) => {
            data = [...newData];
            draw();
        },
        setLine(line){
            gLine = line
        },
        setMax(max){
            gMax = max
        }
    };
}

