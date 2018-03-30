/*
* Created by: Laurens (github.com/razpudding)
*/

const express = require('express')
const path = require('path');
const SSE = require('express-sse')
const moment = require('moment')
const sse = new SSE([]);

const config = {
  tickInterval : 1000,
  upTick: 3,
  downTick: 10,
  historyLength: 100,
}

let data = [
  {
    stocks: [
      {name:"beer", close:0, trend:"up"},
      {name:"wine", close:5, trend:"up"},
      {name:"cocktail", close:10, trend:"up"},
      {name:"bitcoin", close:10, trend:"up"}],
    date: moment().add(-1,'minutes'),
    avg: '7.5',
  },
  {
    stocks: [
      {name:"beer", close:10, trend:"up"},
      {name:"wine", close:15, trend:"up"},
      {name:"cocktail", close:20, trend:"up"},
      {name:"bitcoin", close:15, trend:"up"}],
    date: moment().add(0,'minutes'),
    avg: '15',
  },
]

express()
  .use(express.static('static'))
  .get('/', home)
  .get('/stats', stats)
  .get('/charts', charts)
  .listen(8000)

//Send home.html
function home(req, res){
  res.sendFile(path.join(__dirname + '/static/home.html'));
}

//Send stats.html
function stats(req, res){
  console.log("serving stats")
  res.sendFile(path.join(__dirname + '/static/stats.html'));
}

//Initialise server-sent-events and send the initial data
function charts(req,res){
  console.log("Sending initial data")
  sse.init(req,res)
  sse.send(data.slice(data.length - config.historyLength));
  //Start the trend generator
  try {
    trendGenerator()
  }
  catch(error){
    console.log(error)
  }
}

let trend  //Initialise trend
//This function will generate a trend and send the next "tick" of data.
// TODO: Add major events (that will cause a collapse or sprint of 20-70%)
//       Make the actual growth percentage semi-random for more natural patterns
function trendGenerator(type){
  if (trend) { throw 'Error: Already running a simulation'; }
  trend = "up"
  console.log("trend already running")
  setInterval(() => {
      let last = data[data.length -1]
      let tick = {}

      tick.date = last.date.add(1,'minutes')

      tick.stocks = last.stocks.map(stock => getTickValue(stock))
      console.log("stocks", tick.stocks)
      //tick.beer = getTickValue(+last.beer)
      //tick.wine = getTickValue(+last.wine)
      //tick.cocktail = getTickValue(+last.cocktail)
      //tick.bitcoin = getTickValue(+last.bitcoin)
      let sum = 0;
      tick.stocks.forEach(stock => sum+= stock.close)
      tick.avg = sum/tick.stocks.length
      //tick.avg = Math.round((tick.beer + tick.wine + tick.cocktail + tick.bitcoin)/4) //TODO: make this dynamic

      data.push(tick)
      sse.send(data[data.length -1], "tick");
  }, config.tickInterval);
}
//Should prob be a mini fnction for determining the trend and one for the calc. close value
function getTickValue(stock){
  if (rn(30) ){ //About 3/10 loops will trigger a reroll for the trend
    //console.log("trendSwitch?", trend)
    stock.trend = rn(20) ? "down" : "up"  //80% chance the stock will go up
  }
  if (stock.trend == "up"){
    stock.close *= 1 + (config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick) ))/100  //uptick +/- random() * uptick
    //console.log((config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick)))/100)
  }
  else {
    stock.close /= 1 + (config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100
    stock.close = stock.close < 1 ? 1 : stock.close //Had to add this line because if the close < 1 for some reason it wont correct up anymore, maybe a rounding issue?
    //console.log((config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100)
  }
  stock.close = Math.round(stock.close * 10) / 10  //Do this to round to one decimal
  return stock
}

function rn(chance){
  return Math.random() < chance/100
}

function r(high, low = 0){
  return low + Math.random() * (high - low)
}