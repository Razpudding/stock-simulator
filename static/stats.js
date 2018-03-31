/*
*	TODO: 
*/
console.log("loading stats")
let es = new EventSource('/charts')
let running = false		//Ensure the setup is only performed once
let last;
es.onmessage = function (event) {
	if(running) return
	console.log("once")
	last = JSON.parse(event.data)[0]
	let sectionWrapper = document.createElement('article')
	sectionWrapper.classList.add('wrapper')
	document.body.appendChild(sectionWrapper)
	last.stocks.forEach( stock => {
		if (stock.trend == "off") return
		//if (stat == "date" || stock == "avg") continue
		let sectionEl = document.createElement('section')
		sectionEl.classList.add('stat')
		let h2El = document.createElement('h2')
		h2El.textContent = stock.name
		let pEl = document.createElement('p')
		pEl.id = stock.name
		pEl.textContent ="฿" +  stock.close
		
		sectionWrapper.appendChild(sectionEl)
		sectionEl.appendChild(h2El)
		sectionEl.appendChild(pEl)
	})

	running = true
}

es.addEventListener("tick", function (event) {
	let tick = JSON.parse(event.data)
	let lastClose = {}
	last.stocks.forEach( stock => lastClose[stock.name] = stock.close)
	console.log("tick", tick)
	tick.stocks.forEach( stock => {
		if (stock.trend == "off") return
		//if (stat == "date" || stat == "avg") continue
		let el = document.getElementById(stock.name)
		el.textContent = "฿" + stock.close
		el.className = +stock.close >= +lastClose[stock.name]? "green" : "red"
		el.textContent += +stock.close >= +lastClose[stock.name]? "⇧": "⇩"
	})
	last = tick
})

//Reload the page when the stocks visibility changes
es.addEventListener("reload", function (event) {
  location.reload()
})