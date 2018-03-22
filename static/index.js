let es = new EventSource('/charts')
let stockData = [] 
console.log("loaded")

es.onmessage = function (event) {
  console.log("received message")
  console.log(event)
  JSON.parse(event.data).forEach(d => stockData.push(d))
  //console.log(stockData)
  drawGraph(stockData)
}

// es.addEventListener(eventName, function (event) {
//   console.log("shouldnt happen")
// })

//Update pattern from Titus Wormer https://github.com/cmda-fe3x3/course-17-18/blob/master/site/class-5/filter-join/index.js
//Basic linechart code adapted from Mike Bostock https://bl.ocks.org/mbostock/3883245

var x,
    y,
    line
function drawGraph(data){
  var parseTime = d3.timeParse("%d-%b-%y")
  data.forEach(datum => datum.close *= 1 )
  data.forEach(datum => datum.date = parseTime(datum.date))

  console.log(data[0])
  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
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
      .call(d3.axisBottom(x))
    .select(".domain")
      .remove()

  g.append("g")
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
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
}


// function onchange() {
//   var value = Number(this.value)

//   var circles = svg.selectAll('circle')
//     .data(points.filter(visible))
//     .attr('cx', x)
//     .attr('cy', y)

//   circles.exit()
//     .remove()

//   circles.enter()
//     .append('circle')
//     .attr('cx', x)
//     .attr('cy', y)
//     .attr('r', 2.5)

//   function visible(d) {
//     return x(d) > value
//   }
// }

// function x(d) {
//   return d.x
// }

// function y(d) {
//   return d.y
// }