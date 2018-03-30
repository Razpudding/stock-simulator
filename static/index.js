/*
* TODO: Add nice update like so: http://bl.ocks.org/1wheel/7743519
*/

let es = new EventSource('/charts')
let stockData = [] 
let running = false   //Ensure the setup is only performed once
console.log("loaded")

es.onmessage = function (event) {
  if (running)  return
  JSON.parse(event.data).forEach(d => stockData.push(clean(d)))
  drawGraph(stockData)
  running = true;
}

es.addEventListener("tick", function (event) {
  //console.log("Got new data", event.data)
  stockData.push(clean(JSON.parse(event.data)))
  console.log(stockData)
  update()
})

function clean(item){
  //console.log("cleaning", item)
  let parseTime = d3.timeParse("%d-%b-%y")
  item.date = new Date(item.date)
  item.avg = Number(item.avg)
  console.log(item)
  return item
}
//Update pattern from Titus Wormer https://github.com/cmda-fe3x3/course-17-18/blob/master/site/class-5/filter-join/index.js
//Basic linechart code adapted from Mike Bostock https://bl.ocks.org/mbostock/3883245
let x
let y
let line //Global so update can reach it
function drawGraph(data){
  //console.log(data[0])
  let svg = d3.select("svg")
  let margin = {top: 0, right: 20, bottom: 30, left: 150}
  let width = window.innerWidth - margin.left - margin.right 
  let height = window.innerHeight * 0.8
  
  svg.attr('width', width)
  svg.attr('height', height + 80)
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")  

  x = d3.scaleTime()
  .rangeRound([0, width - 200]) //TODO: fixx padding so the line doesnt run till the right border

  y = d3.scaleLinear()
  .rangeRound([height - 50, 0])

  line = d3.line()
  .x(function(d) { return x(d.date) })
  .y(function(d) { return y(d.avg) })

  x.domain(d3.extent(data, function(d) { return d.date }))
  y.domain(d3.extent(data, function(d) { return d.avg }))

  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "x axis")
   .call(d3.axisBottom(x))

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#fff")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)")
    
  let ticks = d3.selectAll('g.tick > text')
    .attr('font-size', 15)
    .attr('fill', "red")

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

//Updates the line with a rolling window of 100 points (so it should be 100 minutes with current settings)
//TODO: The animation isnt working because I cant figure out how to dynamically calc
//      The right offset for x(). It's some crazy high number like 1523100000000. Gues this
//      is because it's a timescale. I thought it would be 1 minute in millisecs but it's not that.
//      Need to find a way to find the exact amount between two points on the x scale and feed that in
function update() {
  //console.log("updating line")
  if (stockData.length > 100) stockData.shift()
  const svg = d3.select("svg")
  let minDate = d3.min(stockData, function(d) { return d.date.getTime() })
  let maxDate = d3.max(stockData, function(d) { return d.date.getTime() })
  let padding = (maxDate - minDate) * .05
  x.domain([minDate, maxDate + padding]);
  //console.log(x.domain())
  y.domain(d3.extent(stockData, function(d) { return d.avg }))
  let xOffset = x(stockData[stockData.length -1].date.getTime()) - x(stockData[stockData.length -2].date.getTime())
  console.log(xOffset)
  svg.select(".x.axis") // change the x axis
    .call(d3.axisBottom(x))
  svg.select(".y.axis") // change the y axis
    .call(d3.axisLeft(y))
  svg.select('g.tick > text')
    .attr('font-size', 15)
    .attr('fill', "red")
  svg.select(".line")
    .attr("d", line(stockData))
  //   .attr("transform", null)
  // .transition()
  //   .duration(500)
  //   .ease(d3.easeLinear)
  //   .attr("transform", "translate(" + xOffset + ")")
}