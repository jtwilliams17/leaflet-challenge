// Creating map object
var map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
});

// Adding tile layer
L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,
  }
).addTo(map);

//Link to earthquake data as geo JSON
var link =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//Use D3 to grab data
d3.json(link, function (data) {
  var dataFeatures = data.features;

  // loop through data and create attribute variables
  for (var i = 0; i < dataFeatures.length; i++) {
    var coordinates = dataFeatures[i].geometry.coordinates;
    var magnitude = dataFeatures[i].properties.mag;
    var circleSize = magnitude * 10000;
    var location = dataFeatures[i].properties.place;
    var color = "#FFEDA0";

    //change color based on magnitude
    if (magnitude > 5) {
      color = "#F06B6B";
    } else if (magnitude > 4) {
      color = "#F0A76B";
    } else if (magnitude > 3) {
      color = "#F3BA4D";
    } else if (magnitude > 2) {
      color = "#F3DB4D";
    } else if (magnitude > 1) {
      color = "#E1F34D";
    } else {
      color = "#B7F34D";
    }

    //edit circle attributes and add detail pop ups
    L.circle([coordinates[1], coordinates[0]], {
      stroke: true,
      fillOpacity: 1,
      color: "black",
      weight: 0.5,
      fillColor: color,
      radius: circleSize,
    })
      .bindPopup(
        "<h1>" +
          "Earthquake" +
          "</h1> <hr> <h3>Magnitude: " +
          magnitude +
          "</h3> <hr> <h3>Location: " +
          location +
          "</h3>"
      )
      .addTo(map);
  }
});

//return color based on value
function getColor(d) {
  return d > 5
    ? "#F06B6B"
    : d > 4
    ? "#F0A76B"
    : d > 3
    ? "#F3BA4D"
    : d > 2
    ? "#F3DB4D"
    : d > 1
    ? "#E1F34D"
    : d > 0
    ? "#B7F34D"
    : "#FFEDA0";
}

// Create a legend to display information about our map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 2, 3, 4, 5],
    labels = [];

  div.innerHTML += "Magnitude<br><hr>";

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 1) +
      '">&nbsp&nbsp&nbsp&nbsp</i> ' +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }

  return div;
};

//Add legend to the map
legend.addTo(map);
