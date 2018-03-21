var express = require('express')
var SSE = require('express-sse')
var sse = new SSE([]);

//console.log(sse)
var data = [
  {
    id: '1',
    title: 'The first stock',
    value: '5',
    amount: '1'
  },
  {
    id: '2',
    title: 'The second stock',
    value: '15',
    amount: '10'
  }
]

express()
  .use(express.static('static'))
  .get('/charts', sse.init)
  .listen(8000)

charts()
function charts() {
  console.log("loading charts")
  
  //console.log(sse)
  setTimeout(() => {
      console.log(sse)
      sse.send(data);
    }, 6000);
  sse.send(data);
}