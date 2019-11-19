import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSMSource from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import {circular} from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import Control from 'ol/control/Control';
import Geolocation from 'ol/Geolocation';
import Kompas from 'kompas';
import {Fill, RegularShape, Icon, Stroke, Style} from 'ol/style';

var layer1 = new TileLayer({
  source: new OSMSource()
});

var layer2 = new VectorLayer({
  source: new VectorSource()
});

var geolocation = new Geolocation({
  projection: layer2.getSource().getProjection(),
  tracking: true,
  trackingOptions: {
    enableHighAccuracy: true
  }
});

var userPoint;

if (navigator.geolocation) {
  geolocation.on("change", function(event) {
    var userLocation = geolocation.getPosition();
    var accuracy = circular(userLocation, geolocation.getAccuracy());
    layer2.getSource().clear(true);
    layer2.getSource().addFeatures([
      new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
      userPoint = new Feature(new Point(fromLonLat(userLocation)))
    ]);
    if (!layer2.getSource().isEmpty()) {
      map.getView().fit(layer2.getSource().getExtent(), {
        maxZoom: 19,
        duration: 500
      });
    }
  });
} else {
    alert("Geolocation is not supported by this browser.");
}

var compass = new Kompas();
compass.watch();
compass.on('heading', function(heading) {
  userPoint.setStyle(new Style({
    image: new RegularShape({
      fill: new Fill({color: 'red'}),
      stroke: new Stroke({color: 'black', width: 2}),
      points: 3,
      radius: 10,
      angle: Math.PI / 180 * heading,
      rotateWithView: true
    })
  }))
});

var map = new Map({
  target: 'map-container',
  layers: [ layer1, layer2
    // new TileLayer({
      // source: new OSMSource()
    // }),
  ],
  view: new View({
    center: fromLonLat([-3.179090, 51.481583]),
    zoom: 14
  })
});

// navigator.geolocation.watchPosition(function(pos) {
//   const coords = [pos.coords.longitude, pos.coords.latitude];
//   const accuracy = circular(coords, pos.coords.accuracy);
//   layer2.getSource().clear(true);
//   layer2.getSource().addFeatures([
//     new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
//     new Feature(new Point(fromLonLat(coords)))
//   ]);
//   if (!layer2.getSource().isEmpty()) {
//     map.getView().fit(layer2.getSource().getExtent(), {
//       maxZoom: 19,
//       duration: 500
//     });
//   }
// }, function(error) {
//   alert(`ERROR: ${error.message}`);
// }, {
//   enableHighAccuracy: true
// });

const locate = document.createElement('div');
locate.className = 'ol-control ol-unselectable locate';
locate.innerHTML = '<button title="Locate me">◎</button>';
locate.addEventListener('click', function() {
  if (!layer2.getSource().isEmpty()) {
    map.getView().fit(layer2.getSource().getExtent(), {
      maxZoom: 18,
      duration: 500
    });
  }
});
map.addControl(new Control({
  element: locate
}));

