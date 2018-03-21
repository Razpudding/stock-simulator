let es = new EventSource('/charts');
let stockData = {} 
console.log("loaded")

es.onmessage = function (event) {
  console.log("received message")
  console.log(event)
  stockData.last = JSON.parse(event.data)
};

// es.addEventListener(eventName, function (event) {
//   console.log("shouldnt happen")
// });
