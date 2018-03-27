/*
* Created by: Laurens (github.com/razpudding)
*/

const express = require('express')
const path = require('path');
const SSE = require('express-sse')
const moment = require('moment')
const sse = new SSE([]);

const config = {
  tickInterval : 500,
  upTick: 3,
  downTick: 10,
  historyLength: 100,
}

let data = [
  {
    beer: 0,
    wine: 5,
    cocktail: 10,
    date: moment().add(-1,'minutes'),
    avg: '5',
    bitcoin: 10,
  },
  {
    beer: 10,
    wine: 15,
    cocktail: 20,
    date: moment().add(0,'minutes'),
    avg: '15',
  },
  {
    beer: 0,
    wine: 5,
    cocktail: 10,
    date: moment().add(1,'minutes'),
    avg: '5',
  },
  {
    beer: 20,
    wine: 25,
    cocktail: 30,
    date: moment().add(2,'minutes'),
    avg: '25',
  },
  {
    beer: 5,
    wine: 10,
    cocktail: 15,
    date: moment().add(3,'minutes'),
    avg: '10',
    bitcoin: 10,
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

      tick.beer = getTickValue(+last.beer)
      tick.wine = getTickValue(+last.wine)
      tick.cocktail = getTickValue(+last.cocktail)
      tick.bitcoin = getTickValue(+last.bitcoin)
      tick.avg = Math.round((tick.beer + tick.wine + tick.cocktail + tick.bitcoin)/4) //TODO: make this dynamic

      data.push(tick)
      sse.send(data[data.length -1], "tick");
  }, config.tickInterval);
}

function getTickValue(close){
  if (rn(30) ){ //About 3/10 loops will trigger a reroll for the trend
    //console.log("trendSwitch?", trend)
    trend = rn(20) ? "down" : "up"  //80% chance the stock will go up
  }
  if (trend == "up"){
    close *= 1 + (config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick) ))/100  //uptick +/- random() * uptick
    //console.log((config.upTick + (rn(50) ? r(config.upTick) : - r(config.upTick)))/100)
  }
  else {
    close /= 1 + (config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100
    close = close < 1 ? 1 : close //Had to add this line because if the close < 1 for some reason it wont correct up anymore, maybe a rounding issue?
    //console.log((config.downTick + (rn(50) ? r(config.downTick) : - r(config.downTick) ))/100)
  }

  return Math.round(close * 10) / 10  //Do this to round to one decimal
}

function rn(chance){
  return Math.random() < chance/100
}

function r(high, low = 0){
  return low + Math.random() * (high - low)
}