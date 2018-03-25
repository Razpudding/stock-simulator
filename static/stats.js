/*
*	TODO: 
*/
console.log("loading stats")
let es = new EventSource('/charts')

es.onmessage = function (event) {
  console.log("once")
  let data = JSON.parse(event.data)[0]
  for (stat in data){
		if (stat == "date") continue
		let sectionEl = document.createElement('section')
		sectionEl.classList.add('stat')
		let h2El = document.createElement('h2')
		h2El.textContent = stat
		let pEl = document.createElement('p')
		pEl.id = stat
		pEl.textContent = data[stat]
		
		document.body.appendChild(sectionEl)
		sectionEl.appendChild(h2El)
		sectionEl.appendChild(pEl)
		//document.getElementById("statsSection").appendChild(h2El)
		//document.getElementById("statsSection").appendChild(pEl)
	}
}

es.addEventListener("tick", function (event) {
	let data = JSON.parse(event.data)
	console.log("tick", data)
	for (stat in data){
		if (stat == "date") continue
		document.getElementById(stat).textContent = data[stat]
	}	
	console.log(data)	
})