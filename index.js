var express = require('express')
var path = require('path');
var SSE = require('express-sse')
var moment = require('moment')
var sse = new SSE([]);
//console.log(sse)
var data = [
  {
    id: '1',
    title: 'The first stock',
    date: moment().add(-1,'days').format('DD-MMM-YY'),
    close: '5',
    amount: '1'
  },
  {
    id: '2',
    title: 'The second stock',
    date: moment().add(0,'days').format('DD-MMM-YY'),
    close: '15',
    amount: '10'
  },
  {
    id: '3',
    title: 'The second stock',
    date: moment().add(1,'days').format('DD-MMM-YY'),
    close: '5',
    amount: '10'
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
}