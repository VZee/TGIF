//variables
var map;
var infoWindow;
var service;
var METERS = 1609;
var miles = 5;
var zoomNum = 12;
var distance = Math.round(miles * METERS);
var markerArray = [];
var mapCenter;

//get the new distance
function newDistance(){
  //set the background 
  document.getElementById("map").style.backgroundColor = "#E7E6E6";
  document.getElementById("map").innerHTML = "Loading";

  //get the new miles, distance, and zoomNum
  miles = parseInt(document.getElementsByName("distance")[0].value);
  distance = Math.round(miles * METERS);

  if(miles == 5)
    zoomNum = 12;
  
  else if(miles == 10)
    zoomNum = 11;
  
  else if(miles == 20)
    zoomNum = 10;

  getLocation(miles, zoomNum);
}


//get the user's location and call the show location and show map functions
function getLocation(newMiles, newZoom){
    //clear any markers
    if(markerArray.length > 0)
      setMapOnAll(null);

    //set the distance
    miles = newMiles;
    zoomNum = newZoom;
    distance = Math.round(miles * METERS);

    //see if the location is valid
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(showLocation);
      navigator.geolocation.getCurrentPosition(showMap);
    } 
    else
        document.getElementById("city").innerHTML = "Geolocation is not supported by this browser";
}


//display the city and state information
function showLocation(location){
  var position = location.coords.latitude + "," + location.coords.longitude;
  var myCity;

  $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng="+position+"&key=AIzaSyAbr8__LLnqcUjioJmltTlRqHI0FCEz7dw").done(function(data) {  
      myCity = data.results[0]["address_components"][2]["long_name"];
      document.getElementById("city").innerHTML = myCity;
  });
}

//display the localized map
function showMap(location){
  mapCenter = new google.maps.LatLng(location.coords.latitude,location.coords.longitude);
  map = new google.maps.Map(document.getElementById("map"),{
    center: mapCenter,
    zoom: zoomNum
  });

  //call the function to show the radius as a circle on the map
  showCircle(location);
}


//display a circle of the specified radius on the map
function showCircle(location){
  var circle = new google.maps.Circle({
    strokeColor: "#6e6e6e",
    strokeOpacity: 0.7,
    strokeWeight: 1.5,
    fillOpacity: 0,
    map: map,
    center: mapCenter,
    radius: distance
  });

  //call the get search function
  getSearch(location);
}


//get the search to be performed on the map
function getSearch(location){
  var request = {
    location: mapCenter,
    radius: distance,
    type: ["restaurant", "bar"],
    keyword: ["(brewery) OR (pub) OR (distillery) OR (beer)"]
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}


//get the results of the search
function callback(results, status){
  if(status == google.maps.places.PlacesServiceStatus.OK){
    for(var i = 0; i < results.length; i++)
      createMarker(results[i]);
  }
}


//create and display the markers
function createMarker(place){
  var placeLat = place.geometry.location.lat();
  var placeLng = place.geometry.location.lng();
  var placeLoc = new google.maps.LatLng(placeLat, placeLng);

  var marker = new google.maps.Marker({
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    position:{lat: placeLat, lng: placeLng},
  });

  //add the markers to the map
  marker.setMap(map);
  markerArray.push(marker);

  //info window for the marker
  var infoWindow = new google.maps.InfoWindow({
    content:place.name
  });

  //listen for click events
  marker.addListener('click', function() {
    infoWindow.open(map, marker, place);
  });
}


//set map on all sets all the markers to null
function setMapOnAll(map) {
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(map);
  }
}


//document ready funciton
$(document).ready(function(){
    //populate the city and state information
    getLocation(miles, zoomNum);
});
