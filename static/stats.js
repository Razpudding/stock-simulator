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
	for (stat in last){
		if (stat == "date" || stat == "avg") continue
		let sectionEl = document.createElement('section')
		sectionEl.classList.add('stat')
		let h2El = document.createElement('h2')
		h2El.textContent = stat
		let pEl = document.createElement('p')
		pEl.id = stat
		pEl.textContent ="฿" +  last[stat]
		
		sectionWrapper.appendChild(sectionEl)
		sectionEl.appendChild(h2El)
		sectionEl.appendChild(pEl)
	}
	running = true
}

es.addEventListener("tick", function (event) {
	let tick = JSON.parse(event.data)

	console.log("tick", tick)
	for (stat in tick){
		if (stat == "date" || stat == "avg") continue
		let el = document.getElementById(stat)
		el.textContent = "฿" + tick[stat]
		el.className = +tick[stat] >= +last[stat]? "green" : "red"
		el.textContent += +tick[stat] >= +last[stat]? "⇧": "⇩"
	}
	last = tick
})