/*
* TODO: 
*/

let es = new EventSource('/stream')
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

//Reload the page when the stocks visibility changes
es.addEventListener("reload", function (event) {
  location.reload()
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
let charts = {}
//let x
//let y
//let line //Global so update can reach it
function drawGraph(data){
  console.log(data)
  //Take the last data point from the initial data and use that to generate a chart for each stock
  const dataPoint = data[data.length-1]
  numStocks = 0
  dataPoint.stocks.forEach(stock => numStocks += (stock.trend != "off"))  //TODO: turn this into a filter and pass filtered tdata to the foreach below
  dataPoint.stocks.forEach(stock => {
    if (stock.trend == "off") return
    let svg = d3.select("body").append("svg")
    svg.attr("id", stock.name)
    let margin = {top: 0, right: 200, bottom: 0, left: 150}
    //let filler = dataPoint.stocks.length % 2  //We dont want the total width to be divided by 2.5 in case of 5 stocks but
    let width = (window.innerWidth - margin.left - margin.right)/Math.round(numStocks /2) //Have two rows of charts
    let height = (window.innerHeight / 2) * .6 //Rows of charts to display
    
    svg.attr('width', width)
    svg.attr('height', height * 1.1)
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")  

    let x = d3.scaleTime()
    .rangeRound([0, width])

    let y = d3.scaleLinear()
    .rangeRound([height -10, +50])

    //data.forEach(d => console.log(d.stocks.find(s => s.name == stock.name)))

    let line = d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.stocks.find(s => s.name == stock.name).close) })  //Return the close value of the current stock

    x.domain(d3.extent(data, function(d) { return d.date }))
    y.domain(d3.extent(data, function(d) { return d.stocks.find(s => s.name == stock.name).close }))
    charts[stock.name] = {svg, x, y, line}

    console.log(stock.name, y.domain())
    console.log("and", charts[stock.name].y.domain())

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
     .call(d3.axisBottom(x))

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#fff")
        .attr("x", width/2)
        //.attr("dx", "1.2em")  //TODO: make dx dynamic depending on length of the name of the stock
        .attr("y", height/10)
        .attr("text-anchor", "end")
        .text(stock.name+ "(฿)")
        .attr("font-size", (1.3 + 3/numStocks)+"em")
      
    let ticks = d3.selectAll('g.tick > text')
      .attr('font-size', "2em")
      .attr('fill', "red")

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", (.08 + .3/numStocks)+"em")
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
  if (stockData.length > 100) stockData.shift()     //Turn this line off to always show a complete history of the data
  
  stockData[stockData.length -1].stocks.forEach(stock => {   
    if (stock.trend == "off") return
    const svg = charts[stock.name].svg
    let minDate = d3.min(stockData, function(d) { return d.date.getTime() })
    let maxDate = d3.max(stockData, function(d) { return d.date.getTime() })

    let minY = d3.min(stockData, function(d) { return d.stocks.find(s => s.name == stock.name).close })
    let maxY = d3.max(stockData, function(d) { return d.stocks.find(s => s.name == stock.name).close })
    //console.log(stock.name, maxY)
    let xPadding = (maxDate - minDate) * .05
    let yPadding = (maxY - minY) * 0.05
    charts[stock.name].x.domain([minDate, maxDate + xPadding]);
    charts[stock.name].y.domain([minY, maxY + yPadding])
    svg.select(".x.axis") // change the x axis
      .call(d3.axisBottom(charts[stock.name].x))
    svg.select(".y.axis") // change the y axis
      .call(d3.axisLeft(charts[stock.name].y))
    svg.select('g.tick > text')
      .attr('font-size', "2em")
      .attr('fill', "red")
    svg.select(".line")
      //.transition()
      .attr("d", charts[stock.name].line(stockData))
  })
}