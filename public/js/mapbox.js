
export const displayMap = (locations) => {

  mapboxgl.accessToken =
  'pk.eyJ1IjoibXVoYW1tYWR0YWltb29yMTIiLCJhIjoiY2tqenBybDVtMDZyZTMxbnlzNHo4dDNteSJ9.acuvARe9pZoustYguVJ6HQ';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/muhammadtaimoor12/ckk2zxorm3pal18p0cdh05qkm',
  scrollZoom: false
  // center : [-118.6919246,34.0201613],
  // zoom : 10,
  // interactive : false
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  //CREATE MARKER THEN ADDD MARKER X
  const el = document.createElement('div');
  el.className = 'marker';
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

    //ADD POPUP IN MAP
  new mapboxgl.Popup({
    offset:30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);

  //EXTEND MAP BOUND TO INCLUDE CURRENT LOCATION
  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 100,
    left: 100,
    right: 100,
  },
});
 
}
