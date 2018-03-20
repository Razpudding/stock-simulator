var es = new EventSource('/charts');
console.log("loaded")
es.onmessage = function (event) {
  console.log("received message")
  console.log(event)
};

// es.addEventListener(eventName, function (event) {
//   console.log("shouldnt happen")
// });
