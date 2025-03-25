Promise.all([
    readTextFile("templates/first_templates.json")
]).then((res)=>{

let banned = ["h#","pau"]
let templates = Object.entries(JSON.parse(res[0]))
templates = templates.filter((tmpl)=>!banned.includes(tmpl[0]))
templates.forEach(tmpl=>{
    let length = 0
    tmpl[1].forEach(arr=>length+=arr.length)
    tmpl.push(length)
})
templates.sort((a,b)=>Math.sign(b[2]-a[2]))
let main = makevbox(templates.map(tmpl=>{
    return make2DArrayViewGallery(tmpl[0],tmpl[1],20)
}))

document.body.appendChild(main)
})