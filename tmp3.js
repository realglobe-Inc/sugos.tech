const json = require('./lib/components/data/articles.json')

function resize(x) {
  return Math.round((x * 320 / 854) * 10) / 10
}

let newJson = json.map(obj => {
  let {canvas1, canvas2} = obj.body
  for (let canvas of [canvas1, canvas2]) {
    canvas.dx = resize(canvas.dx)
    canvas.dy = resize(canvas.dy)
    canvas.width = resize(canvas.width)
  }
  return obj
})

console.log(JSON.stringify(newJson, null, '  '))
