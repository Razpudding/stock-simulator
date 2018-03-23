/*
* TODO: Add nice update like so: http://bl.ocks.org/1wheel/7743519
*/

let es = new EventSource('/charts')
let stockData = [] 
console.log("loaded")

es.onmessage = function (event) {
  console.log("received message")
  console.log(event)
  JSON.parse(event.data).forEach(d => stockData.push(clean(d)))
  console.log(stockData)
  drawGraph(stockData)
}

es.addEventListener("tick", function (event) {
  console.log("Got new data", event.data)
  stockData.push(clean(JSON.parse(event.data)))
  //stockData.push({"date" : event.data.date, "close": +event.data.close})
  console.log(stockData)
  update()

})

function clean(item){
  //console.log("cleaning", item)
  let parseTime = d3.timeParse("%d-%b-%y")
  item.date = parseTime(item.date)
  item.close = Number(item.close)
  console.log(item)
  return item
}
//Update pattern from Titus Wormer https://github.com/cmda-fe3x3/course-17-18/blob/master/site/class-5/filter-join/index.js
//Basic linechart code adapted from Mike Bostock https://bl.ocks.org/mbostock/3883245
let x
let y
let line //Global so update can reach it
function drawGraph(data){
  //let parseTime = d3.timeParse("%d-%b-%y")
 // data.forEach(datum => datum.close *= 1 )
  //data.forEach(datum => datum.date = parseTime(datum.date))

  console.log(data[0])
  let svg = d3.select("svg")
  let margin = {top: 0, right: 20, bottom: 30, left: 50}
  let width = window.innerWidth - margin.left - margin.right 
  let height = window.innerHeight * 0.8
  svg.attr('width', width)
  svg.attr('height', height + 80)
  console.log(svg.attr("width"))
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")  

  x = d3.scaleTime()
      .rangeRound([0, width])

  y = d3.scaleLinear()
      .rangeRound([height, 0])

  line = d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(d.close) })

  x.domain(d3.extent(data, function(d) { return d.date }))
  y.domain(d3.extent(data, function(d) { return d.close }))

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(d3.axisBottom(x))

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)")

  g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3.5)
      .attr("class", "line")
      .attr("d", line)
}


function update() {
  console.log("updating line")
  const svg = d3.select("svg")
  x.domain(d3.extent(stockData, function(d) { return d.date }))
  y.domain(d3.extent(stockData, function(d) { return d.close }))
  svg.select(".line")
    .attr("d", line(stockData));
  svg.select(".x.axis") // change the x axis
    .call(d3.axisBottom(x))
  svg.select(".y.axis") // change the y axis
    .call(d3.axisLeft(y))
}