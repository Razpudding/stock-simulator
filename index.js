/*
* Created by: Laurens (github.com/razpudding)
*/

const express = require('express')
const path = require('path');
const SSE = require('express-sse')
const moment = require('moment')
const sse = new SSE([]);

const config = {
  tickInterval : 100,
  upTick: 1.03,
  downTick: 1.10,
}

let data = [
  {
    beer: 0,
    wine: 5,
    cocktail: 10,
    date: moment().add(-1,'days'),
    avg: '5',
    bitcoin: 10,
  },
  {
    beer: 10,
    wine: 15,
    cocktail: 20,
    date: moment().add(0,'days'),
    avg: '15',
  },
  {
    beer: 0,
    wine: 5,
    cocktail: 10,
    date: moment().add(1,'days'),
    avg: '5',
  },
  {
    beer: 20,
    wine: 25,
    cocktail: 30,
    date: moment().add(2,'days'),
    avg: '25',
  },
  {
    beer: 5,
    wine: 10,
    cocktail: 15,
    date: moment().add(3,'days'),
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
  sse.send(data);
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

      tick.date = last.date.add(1,'days')

      tick.beer = getTickValue(+last.beer)
      tick.wine = getTickValue(+last.wine)
      tick.cocktail = getTickValue(+last.cocktail)
      tick.bitcoin = getTickValue(+last.bitcoin)
      tick.avg = Math.round((tick.beer + tick.wine + tick.cocktail)/3)

      data.push(tick)
      sse.send(data[data.length -1], "tick");
  }, config.tickInterval);
}

function getTickValue(close){
  if (Math.random() < .3 ){ //About 3/10 loops will trigger a reroll for the trend
    //console.log("trendSwitch?", trend)
    trend = Math.random() < .2 ? "down" : "up"  //80% chance the stock will go up
  }
  if (trend == "up"){
    close *= config.upTick
  }
  else {
    close /= config.downTick
  }
  return Math.round(close * 10) / 10  //Do this to round to one decimal
}