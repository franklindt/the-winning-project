require('dotenv').config()
const axios = require('axios').default;

const express = require('express')
const app = express()
const port = 3000

// async function getGoo(address) {
//   axios.get({
//     method:"get",
//     url:"https://maps.googleapis.com/maps/api/geocode/json?",
//     params: {
//       address: address,
//       key: process.env.GOOGLE_MAPS_API_KEY
//     }
//   }).then((response) => {
//     console.log(response);
//     return {latitude: response.results[0].geometry.location.lat, longitude: response.results.geometry.location.lng};
//   })
// }

app.get('/', (req, res) => {
  var start = {longitude: req.query.start_lng,latitude: req.query.start_lat};
  var destination = {longitude: req.query.dest_lng, latitude: req.query.dest_lat};
  console.log(start.longitude + "," + start.latitude + "\n" + destination.longitude + "," + destination.latitude);
  res.send(200);
})

app.get('/bah', (req, res) => {
  var start, end;
  axios({
    method:"get",
    url:"https://maps.googleapis.com/maps/api/geocode/json?",
    params: {
      address: req.query.start,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  }).then((response) => {
    start = {latitude: response.data.results[0].geometry.location.lat, longitude: response.data.results[0].geometry.location.lng};
    axios({
      method:"get",
      url:"https://maps.googleapis.com/maps/api/geocode/json?",
      params: {
        address: req.query.destination,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    }).then((response) => {
      end = {latitude:response.data.results[0].geometry.location.lat, longitude:response.data.results[0].geometry.location.lng};




      var distance = Math.sqrt((start.latitude-end.latitude)**2+(start.longitude-end.longitude)**2)
      if (start.latitude > end.latitude) {var temp = start.latitude; start.latitude = end.latitude; end.latitude = temp}
      if (start.longitude > end.longitude) {var temp = start.longitude; start.longitude = end.longitude; end.longitude = temp}


      var roads = {};
      var promises = [];

      for (var i = 0;i < distance; i+=0.013) {
        // console.log(start.latitude+(i*Math.sqrt(1-((end.longitude-start.longitude)/distance)**2)));
        promises.push(
          axios({
            method: "get",
            url:"http://api.geonames.org/findNearbyStreetsOSMJSON?",
            params: {
              lat: start.latitude+(i*Math.sqrt(1-((end.longitude-start.longitude)/distance)**2)),
              lng: start.longitude+(i*Math.sqrt(1-((end.latitude-start.latitude)/distance)**2)),
              username: process.env.GEONAMES_USERNAME
            }
          }).then((response) => {
            console.log(response.data.streetSegment)
            if (response.data.streetSegment != null && response.data.streetSegment != undefined) {
              for (var j = 0; j < response.data.streetSegment.length; j++) {
                exists = false;
                for (var name in roads) { // simply iterate over the keys in the first object
                    if (Object.hasOwnProperty.call(response.data.streetSegment[j].name, name)) { // and check if the key is in the other object, too
                        exists = true;
                        break;
                    }
                }

                if (!exists) {
                  temporary = response.data.streetSegment[j].line.split(',')[0];
                  roads[response.data.streetSegment[j].name] = {latitude: parseFloat(temporary.split(' ')[0]), longitude: parseFloat(temporary.split(' ')[1])}
                }
              }
            }
          })
        )
      }

      Promise.all(promises).then(() => res.send(roads));









    })
  })
})

app.listen(port, () => {
  console.log(`hotwheels listening on port ${port}`)
})