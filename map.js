// COLORS ---------------------------------------

var colorPalette = ["#731b65","#9d2a69","#c73974","#e5677a","#ec9181","#f1b2a2","#ebc1a3","#ebd3a8","#f1e7be"]

function getColor(d) {
    return d > 200 ? colorPalette[0] :
           d > 150 ? colorPalette[1] :
           d > 100 ? colorPalette[2] :
           d > 80 ? colorPalette[3] :
           d > 60 ? colorPalette[4] :
           d > 40 ? colorPalette[5] :
           d > 20 ? colorPalette[6] :
           d > 10 ? colorPalette[7] :
                    colorPalette[8];
}


// STATES ---------------------------------------

var states;

function stateStyle(feature) {
  return {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#222',
    opacity: 1,
    weight: 2,
  };

}

nfObject = new Intl.NumberFormat('en-US');

function zoomToFeatureStates(stateId) {
  return function() {
    const state = statesData.features.find((feature) => {
      return feature.id === stateId
    })
    const stateGeoJson = L.geoJson(state)
    map.fitBounds(stateGeoJson.getBounds())
    document.getElementById("resultsState").innerHTML = state.properties.name
    document.getElementById("resultsStatePop").innerHTML = 'Population: ' + '<b>' + nfObject.format(state.properties.statePopulation) + '</b>'
    document.getElementById("resultsStateDist").innerHTML = 'Distance to Care: <b>' + nfObject.format(state.properties.weightedDistance) + ' km </b>'
  }
}

function onEachState(feature, layer) {
    layer.on({
        // mouseover: highlightState,
        // mouseout: resetHighlightStates,
        // click: zoomToFeatureStates,
    });
    layer.on('click', function (e) {
    });
}

var states = L.geoJson(statesData,{
  style: stateStyle, 
  onEachFeature: onEachState,
  interactive: false,
  });


// COUNTIES ---------------------------------------

var counties;

function countiesStyle(feature) {
  return {
    fillColor: getColor(feature.properties.weightedDistance),
    fillOpacity: 1,
    color: '#888',
    opacity: 1,
    weight: 0.5
  };

}

function highlightCounty(e) {
    var layer = e.target;
    layer.setStyle({
        fillColor: '#ccc',
        fillOpacity: 1,
        color: 'blue',
        opacity: 1,
        weight: 0.5
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToBack();
    };
}

function resetHighlightCounty(e) {
  counties.resetStyle(e.target);
}

function zoomToFeatureCounty(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachStateCounty(feature, layer) {
    layer.on({
        mouseover: highlightCounty,
        mouseout: resetHighlightCounty,
        click: zoomToFeatureStates(feature.properties.stateId),
        dblclick: zoomToFeatureCounty
    });
    layer.on('click', function (e) {
        document.getElementById("resultsCounties").innerHTML = feature.properties.name;
        document.getElementById("resultsCountiesPop").innerHTML = 'Population: ' + '<b>' + nfObject.format(feature.properties.countyPopulation) + '</b>';
        document.getElementById("resultsCountiesDist").innerHTML = 'Distance to Care: ' + '<b>' + nfObject.format(feature.properties.weightedDistance) + ' km </b>';
    });
}

var counties = L.geoJson(countiesData,{
  style: countiesStyle, 
  onEachFeature: onEachStateCounty
});


// TRACTS --------------------------------------


// var tracts;

// function style(feature) {
//   return {
//     fillColor: 'blue',
//     fillOpacity: 0.03,
//     color: 'blue',
//     opacity: 0.25,
//     weight: 0.25
//   };

// }

// function highlightTracts(e) {
//     var layer = e.target;
//     layer.setStyle({
//         color: 'blue',
//         opacity: 0.5,
//         fillColor: 'transparent',
//         fillOpacity: 1,
//         weight: 1.25
//     });
//     if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//         layer.bringToBack();
//     };
// }

// function resetHighlightTracts(e) {
//   tracts.resetStyle(e.target);
// }

// function zoomToFeatureTracts(e) {
//   map.fitBounds(e.target.getBounds());
//   var layer = e.target;
//   layer.setStyle({
//     color: 'black',
//     opacity: 0.5,
//     fillColor: 'transparent',
//     fillOpacity: 1,
//     weight: 2
// });
// }

// function onEachStateTracts(feature, layer) {
//     layer.on({
//         mouseover: highlightTracts,
//         mouseout: resetHighlightTracts,
//         click: zoomToFeatureTracts
//     });
//     layer.on('click', function (e) {
//         document.getElementById("resultsTracts").innerHTML = feature.properties.NAMELSAD;
//         document.getElementById("resultsTractsPop").innerHTML = 'Population: ' + feature.properties.raceall;
//         document.getElementById("resultsTractsNearest").innerHTML = 'Nearest Stroke Center: ' + feature.properties.raceall;
//         document.getElementById("resultsTractsDistance").innerHTML = 'Distance to Nearest Stroke Center: ' + feature.properties.raceall;
//     });
// }

// var tracts = L.geoJson(tractData,{
//   style:style, onEachFeature: onEachStateTracts
// });


//INIT---------------------------------------

var map = L.map('mapid', {
  center: [38.5,-96],
  zoom: 5,
  layers: [counties, states]
});


var baseRegions = {
  'Counties': counties,
};

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox/light-v10',
  tileSize: 512,
  zoomOffset: -1,
  maxZoom: 8,
}).addTo(map);



(function() {
	var control = new L.Control({position:'topright'});
	control.onAdd = function(map) {
			var azoom = L.DomUtil.create('a','resetzoom');
			azoom.innerHTML = "<input type='button' value='Reset Zoom' style='padding:5px;'></input>";
			L.DomEvent
				.disableClickPropagation(azoom)
				.addListener(azoom, 'click', function() {
					map.setView(map.options.center, map.options.zoom);
				},azoom);
			return azoom;
		};
	return control;
}())
.addTo(map);


