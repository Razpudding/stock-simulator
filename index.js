/*
* Created by: Laurens (github.com/razpudding)
*/

var express = require('express')
var path = require('path');
var SSE = require('express-sse')
var moment = require('moment')
var sse = new SSE([]);

var data = [
  {
    date: moment().add(-1,'days'),
    close: '5',
  },
  {
    date: moment().add(0,'days'),
    close: '15',
  },
  {
    date: moment().add(1,'days'),
    close: '5',
  },
  {
    date: moment().add(2,'days'),
    close: '25',
  },
  {
    date: moment().add(3,'days'),
    close: '10',
  },
]

express()
  .use(express.static('static'))
  .get('/', home)
  .get('/charts', charts)
  .listen(8000)

//Send home.html
function home(req, res, next){
  res.sendFile(path.join(__dirname + '/static/home.html'));
}

//Initialise server-sent-events and send the initial data
function charts(req,res){
  console.log("Sending initial data")
  sse.init(req,res)
  sse.send(data);
  //Start the trend generator
  trendGenerator()
}

//This function will generate a trend and send the next "tick" of data.
// TODO: Add major events (that will cause a collapse or sprint of 20-70%)
//       Make the actual growth percentage semi-random for more natural patterns
function trendGenerator(type){
  let trend = "up"
  setInterval(() => {
      let date = data[data.length -1].date.add(1,'days')
      let close = +data[data.length -1].close
      if (Math.random() < .5 ){ //About 3/10 loops will trigger a reroll for the trend
        //console.log("trendSwitch?", trend)
        trend = Math.random() < .3 ? "down" : "up"  //70% chance the stock will go up
      }
      if (trend == "up"){
        close *= 1.03
      }
      else {
        close /= 1.1
      }
      data.push({"date": date, "close": close})
      sse.send(data[data.length -1], "tick");
  }, 1000);
}