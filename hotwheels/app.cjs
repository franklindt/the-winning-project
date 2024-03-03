require('dotenv').config()
const axios = require('axios').default;


const cors = require("cors")

const express = require('express')
const app = express()
const port = 2000


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-origin", "*")
  res.setHeader('Access-Control-Allow-Methods', "GET,POST,OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
})
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

function sub(str) {
  ret = str
  if (ret.indexOf("Road") > 0) {
    ret = ret.replace("Road", "RD")
  }
  if (ret.indexOf("Drive") > 0) {
    ret = ret.replace("Drive", "DR")
  }
  if (ret.indexOf("Crescent") > 0) {
    ret = ret.replace("Crescent", "Cres")
  }
  if (ret.indexOf("Street") > 0) {
    ret = ret.replace("Street", "ST")
  }
  if (ret.indexOf("Court") > 0) {
    ret = ret.replace("Court", "CRT")
  }
  if (ret.indexOf("Boulevard") > 0) {
    ret = ret.replace("BOulevard", "BLVD")
  }
  if (ret.indexOf("Avenue") > 0) {
    ret = ret.replace("Avenue", "AVE")
  }
  if (ret.indexOf("Terrace") > 0) {
    ret = ret.replace("Terrace", "TER")
  }
  if (ret.indexOf("Circuit") > 0) {
    ret = ret.replace("Circuit", "CIRC")
  }
  if (ret.indexOf("South") > 0) {
    ret = ret.replace("South", 'S')
  }
  if (ret.indexOf("North") > 0) {
    ret = ret.replace("North", 'N')
  }
  if (ret.indexOf("East") > 0) {
    ret = ret.replace("East", 'E')
  }
  if (ret.indexOf("West") > 0) {
    ret = ret.replace("West", 'W')
  }
  return ret
}

app.get('/named', (req, res) => {
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











app.get('/', (req, res) => {
    start = {latitude: parseFloat(req.query.start_lat), longitude: parseFloat(req.query.start_lng)};
    end = {latitude: parseFloat(req.query.end_lat), longitude: parseFloat(req.query.end_lng)};

    console.log(start)
    console.log(end)


    var distance = Math.sqrt((start.latitude-end.latitude)**2+(start.longitude-end.longitude)**2)
    if (start.latitude > end.latitude) {var temp = start.latitude; start.latitude = end.latitude; end.latitude = temp}
    if (start.longitude > end.longitude) {var temp = start.longitude; start.longitude = end.longitude; end.longitude = temp}


    var roads = {};
    var names = [];
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
          // console.log(response.data)
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
                roads[response.data.streetSegment[j].name] = {latitude: parseFloat(temporary.split(' ')[0]), longitude: parseFloat(temporary.split(' ')[1]), crime:null}
                names.push(response.data.streetSegment[j].name);
              }
            }
          }
        })
      )
    }

    Promise.all(promises).then(() => //res.send(roads)
    {
      axios({
        method:"get",
        url:"http://localhost:5000/json"
      }).then(async (result) => {
        for (var k = 0; k < result.data.length; k++) {
          if (result.data[k] == null || result.data[k] == undefined) {
            continue
          }
          for (var l = 0; l < names.length; l++) {
            if (result.data[k].Intersection == null || result.data[k].Intersection == undefined) {
              continue
            }
            temp_key = await sub(names[l])
            // console.log(temp_key.toUpperCase() + '|' + (result.data[k].Intersection).split(',')[0])
            if (temp_key.toUpperCase() == (result.data[k].Intersection).split(',')[0]) {
              roads[names[l]].crime = result.data[k].Offence_Category;
              console.log("reached!")
            }
            // console.log(temp_key.toUpperCase() + '|' + (result.data[k].Intersection).split(', ')[1])
            if (temp_key.toUpperCase() == (result.data[k].Intersection).split(', ')[1]) {
              roads[names[l]].crime = result.data[k].Offence_Category;
              console.log("reached")
            }
          }
        }
        res.send(roads);
      })
      .catch(error => {
        console.error(error);
      });






    }
    );









})


app.get('/test', (req, res) => {
  axios({
    method:"get",
    url:"http://localhost:5000/json"
  }).then((response) => {res.send(response.data)})
})



app.listen(port, () => {
  console.log(`hotwheels listening on port ${port}`)
})



