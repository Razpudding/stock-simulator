/*
* Created by: Laurens (github.com/razpudding)
*/

const express = require('express')
var bodyParser = require('body-parser')
const path = require('path');
const SSE = require('express-sse')
const moment = require('moment')
const sse = new SSE([]);
require('dotenv').config()

const config = {
  tickInterval : 800,
  upTick: 2.5,
  downTick: 8,
  historyLength: 100,
  maxMultiplier: 20,
}

let data = [
  {
    stocks: [
      {name:"communism", close:.5, trend:"off"},
      {name:"capitalism", close:.7, trend:"off"},
      {name:"egocentrism", close:.8, trend:"off"},
      {name:"love", close:1.1, trend:"up"},
      {name:"oil", close:.9, trend:"up"},
      {name:"bitcoin", close:1.0, trend:"up"}
      ],
    date: moment().add(0,'minutes'),
    avg: '15',
  },
]

let manips = {}  //TODO: have this be not global but a param to a function
let maxVals = {}
data[0].stocks.forEach( stock => maxVals[stock.name] = stock.close* config.maxMultiplier)
console.log(maxVals)
//maxVals.stocks.forEach( stock => stock.close *= 10)
express()
  .use(express.static('static'))
  .set('view engine', 'ejs')
  .set('views', 'views')
  .use(bodyParser.urlencoded({extended: true}))
  .get('/', home)
  .get('/stats', stats)
  .get('/stream', stream)
  .get('/change', changePage)
  .post('/', changeData)
  .listen(8000)

//Send home.html
function home(req, res){
  res.sendFile(path.join(__dirname + '/static/home.html'));
}

//Send home.html
function changePage(req, res){
  res.render('change.ejs', {
    stocks: data[data.length-1].stocks,     //Send the last datapoint over
    trends: ["up","down","off", "on"],   
    })
}

function changeData(req,res)
{
  let input = req.body
  console.log(input)
  console.log(input.trend)
  if (input.password == process.env.PASS){
    manips[input.stocks] = {trend: input.trend, ticks: input.ticks}
    console.log(manips)
    if (input.trend == "off" || input.trend == "on"){
      setTimeout(() => {
        sse.send(1, "reload") //send a reload event to the client AFTER the next tick has been sent so it know which graphs to show
      }, config.tickInterval + 1000)
    }
  }
  else { console.log("wrong password") }
  changePage(req,res) //Reload the page
  //TODO: finish this functionality. It should work something like this:
  // simple version: follow trend for var ticks or seconds
  // better version: follow trend until %change has been reached
  // Improve frontend so it will allow for more elaborate manipulations.
  // Add a secret code to .env that needs to be entered every time manip is done
  // Also the add button shouldnt try to route away from the page
}
//Send stats.html
function stats(req, res){
  console.log("serving stats")
  res.sendFile(path.join(__dirname + '/static/stats.html'));
}

//Initialise server-sent-events and send the initial data
function stream(req,res){
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
  trend = "up"  //TODO: old functionality, change the name
  setInterval(() => {
      let last = data[data.length -1]
      let tick = {}

      tick.date = last.date.add(1,'minutes')

      tick.stocks = last.stocks.map(stock => getTickValue(stock))
      console.log("tick", tick.stocks)

      let sum = 0;
      tick.stocks.forEach(stock => sum+= stock.close)
      tick.avg = Math.round(sum/tick.stocks.length * 10) / 10 //TODO: set up dynamic round through config -> DRY
      data.push(tick)

      sse.send(data[data.length -1], "tick");
  }, config.tickInterval);
}
//Should prob be a mini fnction for determining the trend and one for the calc. close value
//TODO: rewrite this function so it's less ugly. Pass manips as an object
function getTickValue(stock){
  if (manips[stock.name] && manips[stock.name].trend == "on") stock.trend = "up" //Turn the stock on!
  if (manips[stock.name] && manips[stock.name].trend == "off") stock.trend = "off" //Turn the stock off!
  if(stock.trend == "off") return stock
  if (manips[stock.name] && manips[stock.name].ticks > 0 && (manips[stock.name].trend == "up" || manips[stock.name].trend == "down")) {
    stock.trend = manips[stock.name].trend  //Basic logic for manipulating stocks
    console.log("manip trend", stock.name, stock.trend, manips[stock.name].ticks)
    manips[stock.name].ticks --
  }
  if (rn(30) ){ //About 3/10 loops will trigger a reroll for the trend
    //console.log("trendSwitch?", trend)
    stock.trend = rn(20) ? "down" : "up"  //80% chance the stock will go up
  }
  if (stock.trend == "up"){
    stock.close *= 1 + (config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick) ))/100  //uptick +/- random() * uptick
    stock.close = stock.close >= maxVals[stock.name] ? maxVals[stock.name] : stock.close 
    //console.log((config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick)))/100)
  }
  else {
    stock.close /= 1 + (config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100
    stock.close = stock.close < 1.1 ? 1.1 : stock.close //Had to add this line because if the close < 1 for some reason it wont correct up anymore, maybe a rounding issue?
    //console.log((config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100)
  }
  stock.close = Math.round(stock.close * 100) / 100  //Do this to round to one decimal
  return stock
}

function rn(chance){
  return Math.random() < chance/100
}

function r(high, low = 0){
  return low + Math.random() * (high - low)
}