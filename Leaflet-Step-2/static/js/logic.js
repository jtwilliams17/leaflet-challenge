// link to earthquake and plate data as geo JSON
var queryURL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var platesURL = "../Leaflet-Step-2/PB2002_plates.json";

//Use D3 to grab data
d3.json(queryURL, function (data) {
  createFeatures(data.features);
});

//return color based on magnitude
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

//set circle size to ratio of magitude
function circleSize(magnitude) {
  return magnitude * 4;
}

function createFeatures(earthquakeData) {
  // Create detail pop ups
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      "<h1>" +
        "Earthquake" +
        "</h1> <hr> <h3>Magnitude: " +
        feature.properties.mag +
        "</h3> <hr> <h3>Location: " +
        feature.properties.place +
        "</h3>"
    );
  }

  // Create a GeoJSON layer with earthquake data
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: circleSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: "#000",
        weight: 0.5,
        fillOpacity: 1,
      });
    },
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define satmap, greyscale, and outdoors layers
  var satmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "satellite-v9",
      accessToken: API_KEY,
    }
  );

  var greymap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  var outdoorsmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: "outdoors-v11",
      accessToken: API_KEY,
    }
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    Satellite: satmap,
    Greyscale: greymap,
    Outdoors: outdoorsmap,
  };

  // Create a layer for the tectonic plates
  var plates = new L.LayerGroup();

  // Create overlay object to hold our overlay layers
  var overlayMaps = {
    Earthquakes: earthquakes,
    Tectonic: plates,
  };

  // Create our map with earthquake and plate layers
  var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satmap, greymap, outdoorsmap, earthquakes, plates],
  });

  // Read the Tectonic Plates data
  d3.json(platesURL, function (platesData) {
    L.geoJSON(platesData, {
      weight: 2,
    }).addTo(plates);
  });

  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(map);

  // Create a legend to display information about our map
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

    div.innerHTML += "Magnitude<br><hr>";

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
}
