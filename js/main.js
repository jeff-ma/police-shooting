var data;
var map;
var markers = [];

function initialize() {
	$('select').material_select();
	$('.datepicker').pickadate({
		format: "mm/dd/yyyy",
		selectMonths: true,
		selectYears: 50,
		max: true
	});
	generateAges();
	setDates();
	getData();
}

function getData() {
	$.ajax({
		type: "get",
	    url:'data/data.json',
	    dataType: "json",
	    success: function(response) {
			data = response;
			createMap();
		}
	});	
}

function createMap() {
	var center = new google.maps.LatLng(40.459117, -95.852203);
	var mapCanvas = document.getElementById("map");
	var mapOptions = {center: center, zoom: 4, mapTypeId:google.maps.MapTypeId.ROADMAP};
	map = new google.maps.Map(mapCanvas, mapOptions);
	google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
   		$("#loader").fadeOut(2000);
   		$("#incident").children(":first").html("Click on a marker for more details");
   		$("#legend").show(1000);   		
	});
	loadMarkers(data);
}

function loadMarkers(data) {
	var color;
	for(var i=0; i<data.length; i++){
		var position = new google.maps.LatLng(data[i].lat, data[i].lng);

		if (data[i]["Hit or Killed?"] == "Killed") {
			color = "#FF0000";
		} else if (data[i]["Hit or Killed?"] == "Hit") {
			color = "#DFE013";
		} else {
			color ="#FFA500";
		}
		var marker = new google.maps.Marker({
			position: position,
			title: "Incident #" + i,
			index: i,
			icon: {
				path:google.maps.SymbolPath.CIRCLE,
				scale: 7,
				strokeColor: color,
				strokeOpacity: 0.7,
				strokeWeight: 2,
				fillColor: color,
				fillOpacity: 0.7
			},
			map:map,
		});
		google.maps.event.addListener(marker, 'click', function () {
			displayIncidentDetails(this.index);
    	});
		markers.push(marker);
	}
	updateMap();
}


function updateMap() {
	var count = 0 ;
	for(var i=0; i<data.length; i++){
		var visible = setMarkerVisble(data[i]);
		markers[i].setVisible(visible);
		if(visible){
			count++;
		}
	}
	displayResults(count);
	pan();
}

function setMarkerVisble(data) {
	var minAge = parseInt(document.getElementById("min-age").value);
	var maxAge = parseInt(document.getElementById("max-age").value);
	var age = parseInt(data["Victim's Age"]);
	var from = document.getElementById("from-date").value;
	var to = document.getElementById("to-date").value;
	var date = data["Date Searched"];
	var searchArmed = document.getElementById("armed").value;
	var personArmed = data["Armed or Unarmed?"];
	var searchInjuredKilled = document.getElementById("injured-killed").value;
	var personInjuredKilled = data["Hit or Killed?"];
	var searchRace = document.getElementById("race").value;
	var personRace = data["Race"];
	return (checkAge(minAge, maxAge, age) && checkDate(from, to, date) && checkArmed(searchArmed, personArmed) && checkInjuredKilled(searchInjuredKilled, personInjuredKilled) && checkRace(searchRace, personRace));
}

function checkAge(minAge, maxAge, age){
	if ((minAge <= age && age <= maxAge) || (maxAge <= age && age <= minAge)){
		return true;
	} else {
		return false;
	}
}

function checkDate(from, to, date) {
	var fromDate = Date.parse(from);
	var toDate = Date.parse(to);
	var searchDate = Date.parse(date);
	if((fromDate <= searchDate && searchDate <= toDate) || (toDate <= searchDate && searchDate <= fromDate)){
		return true;
	} else {
		return false;
	}
}

function checkArmed(searchArmed, personArmed) {
	if(searchArmed == "All") {
		return true;
	} else if(typeof personArmed == "undefined") {
		return false;
	} else if(searchArmed == personArmed){
		return true;
	} else {
		return false;
	}
}

function checkInjuredKilled(searchInjuredKilled, personInjuredKilled) {
	if(searchInjuredKilled == "All"){
		return true;
	} else if(searchInjuredKilled == personInjuredKilled){
		return true;
	} else {
		return false;
	}
}

function checkRace(searchRace, personRace) {
	if(searchRace == "All"){
		return true;
	} else if (typeof personRace == "undefined") {
		return false;
	} else if (personRace.toLowerCase().includes(searchRace.toLowerCase()) ) {
		return true;
	} else {
		return false;
	}
}

function generateAges() {
	var min=2;
	var max=120;
	var ages="";
	var minAge = document.getElementById("min-age");
	var maxAge = document.getElementById("max-age");
	for(var i=min; i<=max; i++){
		ages = ages + '\n <option value="' + i + '">' + i + '</option>'; 
	}
	minAge.innerHTML = '<option value="1" selected>1</option>' + ages + '<option value="120">120</option>';
	maxAge.innerHTML = '<option value="1">1</option>' + ages + '<option value="120" selected>120</option>';
	$('select').material_select();
}

function setDates() {
	var fromDate = document.getElementById("from-date");
	var toDate = document.getElementById("to-date");
	var today = new Date();
	var dd = today.getDate(); 
	var mm = today.getMonth() + 1; 
	var yyyy = today.getFullYear(); 
	toDate.value = mm + "/" + dd + "/" + yyyy;
	fromDate.value = "01/01/1990";

}

function displayResults(count){
	var summary = "";
	var searchResult = document.getElementById("search-results-summary");
	if(count > 1 ){
		summary = "There were <strong>" + count + " people</strong> shot";
	} else if (count == 1) {
		summary = "There was <strong>1 person</strong> shot";
	} else {
		summary = "No matches found";
	}
	searchResult.innerHTML = summary;
}

function displayIncidentDetails(index) {
	var html = '<div class="incident-details">Incident #' + index + '</div><hr/>';
	html = html + '<div id="incident-date">Date: <strong>' + data[index]["Date Searched"] + '</strong></div>';
	if(["State"] in data[index]) {
		html = html + '<div id="incident-state">State: <strong>' + data[index]["State"] + '</strong></div>';
	}
	if(["City"] in data[index]) {
		html = html + '<div id="incident-city">City: <strong>' + data[index]["City"] + '</strong></div>';
	}
	html = html +  '<div class="incident-details">Person shot</div><hr/>';
	if(["Victim Name"] in data[index]) {
		html = html + '<div id="incident-name">Name: <strong>' + data[index]["Victim Name"] + '</strong></div>';
	}
	if(["Victim's Age"] in data[index]) {
		html = html + '<div id="incident-age">Age: <strong>' + data[index][ "Victim's Age"] + '</strong></div>';
	}
	if(["Victim's Gender"] in data[index]) {
		html = html + '<div id="incident-gender">Gender: <strong>' + data[index]["Victim's Gender"] + '</strong></div>';
	}
	if(["Race"] in data[index]) {
		html = html + '<div id="incident-race">Race: <strong>' + data[index]["Race"] + '</strong></div>';
	}
	if(["Armed or Unarmed?"] in data[index]) {
		html = html + '<div id="incident-armed">Armed: <strong>' + data[index]["Armed or Unarmed?"] + '</strong></div>';
	}
	if(["Weapon"] in data[index]) {
		html = html + '<div id="incident-weapon">Weapon: <strong>' + data[index]["Weapon"] + '</strong></div>';
	}
	if(["Hit or Killed?"] in data[index]) {
		var status = data[index]["Hit or Killed?"];
		if(status == "Hit"){
			status = "Injured";
		}
		html = html + '<div id="incident-name">Injured/Killed: <strong>' + status + '</strong></div>';
	}
	html = html + '<div class="incident-details">Police involved</div><hr/>';
	if(["Agency Name"] in data[index]) {
		html = html + '<div id="incident-agency">Agency: <strong>' + data[index]["Agency Name"] + '</strong></div>';
	}
	if(["Name of Officer or Officers"] in data[index]) {
		html = html + '<div id="incident-officer">Officer(s): <strong>' + data[index]["Name of Officer or Officers"] + '</strong></div>';
	}
	if(["Shots Fired"] in data[index]) {
		html = html + '<div id="incident-shots-fired">Shots Fired: <strong>' + data[index]["Shots Fired"] + '</strong></div>';
	}
	if(["Summary"] in data[index]) {
		var summary = data[index]["Summary"];
		// summary = summary.slice(3, summary.length-3);
		html = html + '<div class="incident-details">Summary</div><hr/>';
		html = html + '<div id="incident-summary">' + summary + '</div>';
	}
	if(["Source Link"] in data[index]) {
		html = html + '<br/><div id="incident-source-">Source: <a href="'+ data[index]["Source Link"] + '" target="_blank">' + data[index]["Source Link"] + '</a></div>';
	}
	html = html + "<br/><br/>"
	document.getElementById("incident").innerHTML = html;
}

function pan(){
	var zip = document.getElementById("zip").value;
	var expression = /^[0-9]{5}(?:-[0-9]{4})?$/;
	var lat;
	var lng;
	var latLng;
	var geocoder = new google.maps.Geocoder();
    if(expression.test(zip)) {
    	geocoder.geocode({"address": zip}, function(results, status) {
			if(status === "OK") {
				lat = results[0].geometry.location.lat();
	         	lng = results[0].geometry.location.lng();
	         	latLng = new google.maps.LatLng(lat, lng);
	         	map.setZoom(10);
	         	map.panTo(latLng);
			} 
		});
	}
}

window.onload = initialize;