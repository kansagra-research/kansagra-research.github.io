const dataHospitals = './data/stroke_cert.csv';
const hospitalColor = '#2934d6' // #1640ab //'#5876d1' // change hospital color

var geojsonMarkerStyle = function(color) {
    return {
      radius: 3,
      fillColor: '#8da4fc',
      color: color,
      weight: 1.5,
      opacity: 1,
      fillOpacity: 1
    }
    // layer.bringToFront();
  };
  
function getHospitalPointStyle(certData) {
    // const color = getColor(certData) // comment in when multiple colors are used based on designation
    const color = hospitalColor
    return geojsonMarkerStyle(color)
}


// Read hospital markers
$.get(dataHospitals, function(csvString) {

    var data = Papa.parse(csvString, {header: true, dynamicTyping: true}).data;

    for (var i in data) {
      var row = data[i];
      var str = (
        '<h2>' + row.Hospital + '</h2>' +
        '<b>Certification Level: </b>' + row.Designation +
        '<br/ ><b>Organization: </b>' + row.Organization_x
        );
      var hospitals = L.circleMarker(
          [row.y, row.x], 
          getHospitalPointStyle(row.Designation),
      ).bindPopup(str);
      
      hospitals.addTo(map);
    }

  });