// Function to draw map
var drawMap = function() {  
	map = L.map('map');  // Create map
	map.setView([47.57, -122.39], 10);  // Set initial view for map
	// Create a tile layer
	var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'); 
	layer.addTo(map);  // Add layer to map
}

// Function for getting data
var getData = function() {
	// Execute AJAX request and get map marker location data 
	var data;
	$.ajax({
	    url:'data/response.json',
	    type: "get", success: 
	    function(response) {
	    	data = response;
	    	customBuild(data);
	    }, 
		dataType:"json"
	});
}

// Build settings for map markers and filters 
var customBuild = function(data) {
	var injured =  new L.layerGroup();
	var killed =  new L.layerGroup();
	var under20 = new L.layerGroup();
	var twenty40 = new L.layerGroup();
	var over40 = new L.layerGroup();
	var overlays = {
		"Injured": injured,
		"Killed": killed,
		"Age Under 20": under20,
		"Age 20 to 40": twenty40,
		"Age Over 40": over40
	};

	data.map(function(d) {
		// Determine whether subject was hit or killed and create a new circle marker
		if (d['Hit or Killed?'] == "Killed" ) {
			var circle = new L.circle([d.lat, d.lng], 400, {color:"red", opacity:0.7}).addTo(killed);
		} else {
			var circle = new L.circle([d.lat, d.lng], 400, {color:"blue", opacity:0.7}).addTo(injured);
		}

		// Bind summary of incident on marker popup
		circle.on('mouseover', function() {
			this.bindPopup(d.City + "<br/>" +  d.Summary, {offset:L.point(0, -20)}).openPopup();
		});
		circle.on('mouseout', function() {
			this.closePopup();
		});
		
		// Determine age group of subject and create a new circle marker
		if (d["Victim's Age"] < 20) {
			var circle2 = new L.circle([d.lat, d.lng], 400, {color:"green", opacity:0.7}).addTo(under20);
		} else if (d["Victim's Age"] >= 20 && d["Victim's Age"] < 40) {
			var circle2 = new L.circle([d.lat, d.lng], 400, {color:"brown", opacity:0.7}).addTo(twenty40);
		} else if (d["Victim's Age"] >= 40) {
			var circle2 = new L.circle([d.lat, d.lng], 400, {color:"yellow", opacity:0.7}).addTo(over40);
		}
		
		// Bind summary of incident on marker popup
		if (d["Victim's Age"]) {
			circle2.on('mouseover', function() {
				this.bindPopup(d.City + "<br/>" +  d.Summary, {offset:L.point(0, -20)}).openPopup();
			});
			circle2.on('mouseout', function() {
				this.closePopup();
			});
		}
	});

	// Add markers to map
	injured.addTo(map);
	killed.addTo(map);
	L.control.layers(null, overlays, {collapsed:false}).addTo(map);
}