/*
* TODO: 
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
  stockData.push(clean(JSON.parse(event.data)))
  update()
})

function clean(item){
  let parseTime = d3.timeParse("%d-%b-%y")
  item.date = new Date(item.date)
  item.avg = Number(item.avg)
  item.stocks.forEach(stock => stock.close = Number(stock.close))
  console.log(item)
  return item
}
//Update pattern from Titus Wormer https://github.com/cmda-fe3x3/course-17-18/blob/master/site/class-5/filter-join/index.js
//Basic linechart code adapted from Mike Bostock https://bl.ocks.org/mbostock/3883245
let x
let y
let line //Global so update can reach it
function drawGraph(data){
  console.log(data)
  //Take the last data point from the initial data and use that to generate a chart for each stock
  data[data.length-1].stocks.forEach(stock => {
    let svg = d3.select("body").append("svg")
    svg.attr("id", stock.name)
    let margin = {top: 0, right: 20, bottom: 30, left: 150}
    let width = window.innerWidth - margin.left - margin.right 
    let height = window.innerHeight * 0.8
    
    svg.attr('width', width)
    svg.attr('height', height + 80)
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")  

    x = d3.scaleTime()
    .rangeRound([0, width])

    y = d3.scaleLinear()
    .rangeRound([height -10, +50])

    //data.forEach(d => console.log(d.stocks.find(s => s.name == stock.name)))

    line = d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.stocks.find(s => s.name == stock.name).close) })  //Return the close value of the current stock

    x.domain(d3.extent(data, function(d) { return d.date }))
    y.domain(d3.extent(data, function(d) { return d.stocks.find(s => s.name == stock.name).close }))
    console.log(stock.name, y.domain())

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
     .call(d3.axisBottom(x))

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#fff")
        .attr("x", "3em")
        .attr("dx", "1.2em")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(stock.name+ "(฿)")
        .attr("font-size", "3em")
      
    let ticks = d3.selectAll('g.tick > text')
      .attr('font-size', "2em")
      .attr('fill', "red")

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", ".2em")
      .attr("class", "line")
      .attr("d", line)
  })
  
}

//Updates the line with a rolling window of 100 points (so it should be 100 minutes with current settings)
//TODO: The animation isnt working because I cant figure out how to dynamically calc
//      The right offset for x(). It's some crazy high number like 1523100000000. Gues this
//      is because it's a timescale. I thought it would be 1 minute in millisecs but it's not that.
//      Need to find a way to find the exact amount between two points on the x scale and feed that in
function update() {
  //console.log("updating line")
  if (stockData.length > 100) stockData.shift() 
  
  stockData[stockData.length -1].stocks.forEach(stock => {   
    const svg = d3.select("#"+stock.name)
    let minDate = d3.min(stockData, function(d) { return d.date.getTime() })
    let maxDate = d3.max(stockData, function(d) { return d.date.getTime() })

    let minY = d3.min(stockData, function(d) { return d.stocks.find(s => s.name == stock.name).close })
    let maxY = d3.max(stockData, function(d) { return d.stocks.find(s => s.name == stock.name).close })
    console.log(stock.name, maxY)
    let xPadding = (maxDate - minDate) * .05
    let yPadding = (maxY - minY) * 0.1
    x.domain([minDate, maxDate + xPadding]);
    y.domain([minY, maxY + yPadding])
    //let xOffset = x(stockData[stockData.length -1].date.getTime()) - x(stockData[stockData.length -2].date.getTime())
    svg.select(".x.axis") // change the x axis
      .call(d3.axisBottom(x))
    svg.select(".y.axis") // change the y axis
      .call(d3.axisLeft(y))
    svg.select('g.tick > text')
      .attr('font-size', "2em")
      .attr('fill', "red")
    svg.select(".line")
      .attr("d", line(stockData))
    //   .attr("transform", null)
    // .transition()
    //   .duration(500)
    //   .ease(d3.easeLinear)
    //   .attr("transform", "translate(" + xOffset + ")")
  })
}