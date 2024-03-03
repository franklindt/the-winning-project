import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript , Polyline , StandaloneSearchBox, Marker } from '@react-google-maps/api';
import './App.css';
import { getDistance } from 'geolib';
import axios from 'axios';
const libraries = ["places"];
const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 43.653225,
  lng: -79.383186
};

function App() {

const startBox = useRef(null);
const endBox = useRef(null);


  const onMapClick = event => {
    const geocoder = new window.google.maps.Geocoder();
  
    geocoder.geocode({ location: event.latLng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          alert("Address: " + results[0].formatted_address);
        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
  
    setMarkers(current => [...current, { lat: event.latLng.lat(), lng: event.latLng.lng() }]);
  };
  var adj_array = {};
  var pathCoordinates;
  const onPlacesChanged = (box) => {
    const places = box.current.getPlaces();
    console.log(box.current.getPlaces());
    if (start1===null || start1 === undefined) {
      setStart1(places[0].name);
      console.log("LOL" +start1);
    }
    setEnd1(places[0].name);
    console.log("NOP" + end1);
    // console.log("this is places: !!!!!!!!!!!!!!" , places[0].name);
    const location = places[0].geometry.location;
    setMarkers(current => [...current, { lat: location.lat(), lng: location.lng() }]);
  
    if (markers.length === 2) {
      // console.log(markers[1]);
      const start = markers[0];
      const end = markers[1];
      console.log(start, end);
      console.log("reached")
      axios({
        method:"get",
        url:"http://localhost:2000",
        params: {
          start: start1,
          start_lat: start.lat,
          start_lng: start.lng,
          end: end1,
          end_lat: end.lat,
          end_lng: end.lng
        
      }})
        .then(response => {
          // var neighbours = {}

          // var blah = 10000000000000000000;


          for (const [key, value] of Object.entries(response.data)) {
            var neighbors = {};
            for (const [key1, value1] of Object.entries(response.data)) {
              if (key === key1) {
                continue
              }
              if (Math.abs(value.latitude-value1.latitude) <= 0.1 && Math.abs(value.longitude-value1.longitude) <= 0.1) {
                var distance = Math.sqrt((value.latitude-value1.latitude)**2+(value.longitude-value1.longitude)**2)
                neighbors[key1] = distance;
              } 
            }
            adj_array[key] = neighbors;
            adj_array["Toronto"] = neighbors;
            adj_array["Markham"] = neighbors;
            // console.log(adj_array[key], key);
          }


          // adj_array[end1] = {coordinates: {latitude: end.lat, longitude: end.lng}, neighbors: neighbours}

          // neighbours = {};
          // blah = 1000000000000000
          // for (const [key1, value1] of Object.entries(response.data)) {
          //   if (start1 === key1) {
          //     continue
          //   }
          //   if (Math.abs(Math.abs(start.lat)-Math.abs(value1.latitude))**2 + Math.abs(Math.abs(start.lng)-Math.abs(value1.longitude))**2 < blah**2) {
          //     console.log("hasta la vista")
          //     blah = Math.abs(Math.abs(start.lat)-Math.abs(value1.latitude))**2 + Math.abs(Math.abs(start.lng)-Math.abs(value1.longitude)**2)
          //     neighbours = {}
          //     var distance = Math.sqrt((start.lat-value1.latitude)**2+(start.lng-value1.longitude)**2)
          //     neighbours[key1] = distance
          //   }
          // }

          // adj_array[start1] = {coordinates: {latitude: start.lat, longitude: start.lng}, neighbors: neighbours}

          // console.log("UIEGROGBOWRB"+start1+end1)
          const result = dijkstra(adj_array, start1, end1);
          console.log(result);
          const shortestPath = getPath(result.previous, end1);
          console.log(shortestPath);
          pathCoordinates = [[start.lat, start.lng], [Math.random(end.lat, start.lat)*100, Math.random(end.lng, start.lng)*100], [Math.random(end.lat, start.lat)*100, Math.random(end.lng, start.lng)*100], [Math.random(end.lat, start.lat)*100, Math.random(end.lng, start.lng)*100], [Math.random(end.lat, start.lat)*100, Math.random(end.lng, start.lng)*100], [Math.random(end.lat, start.lat)*100, Math.random(end.lng, start.lng)*100], [end.lat, end.lng]];
          
          console.log(pathCoordinates);
          //console.log(result, pathCoordinates);
          return adj_array;
        })
        .catch(error => {
          console.error(error);
        });
    }
    
  };


  const resetLocations = () => setMarkers([]);

  /*const ref = React.useRef();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA29P_0zghPIM_WkO10guIwiV1R9PdyDPA',
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }
  if (!isLoaded) {
    return <div>Loading maps</div>;
  }*/


  class PriorityQueue {
    constructor() {
      this.queue = [];
    }
  
    enqueue(item, priority) {
      const node = { item, priority };
      if (this.isEmpty()) {
        // If the queue is empty, add the node to the queue
        this.queue.push(node);
      } else {
        // If the queue is not empty, find the correct position to insert the node
        let added = false;
        for (let i = 0; i < this.queue.length; i++) {
          if (priority < this.queue[i].priority) {
            this.queue.splice(i, 0, node);
            added = true;
            break;
          }
        }
        // If the node has not been added, it has the lowest priority and is added at the end of the queue
        if (!added) {
          this.queue.push(node);
        }
      }
    }
  
    dequeue() {
      if (this.isEmpty()) {
        throw new Error('Queue is empty');
      }
      return this.queue.shift().item;
    }
  
    peek() {
      if (this.isEmpty()) {
        throw new Error('Queue is empty');
      }
      return this.queue[0].item;
    }
  
    isEmpty() {
      return this.queue.length === 0;
    }
  }

function dijkstra(graph, startNode, endNode) {
  let distances = {};
  let previous = {};
  let queue = new PriorityQueue();

  // Set distances to all nodes to be infinite except startNode
  for(let node in graph) {
      distances[node] = Infinity;
      previous[node] = null;
  }
  graph[startNode][endNode] = 100;
  graph[endNode][startNode] = 100;
  distances[startNode] = 0;
  console.log("lol" + graph[startNode]);

  queue.enqueue(startNode, 0);

  while(!queue.isEmpty()) {
      let shortestDistanceNode = queue.dequeue();
      console.log(graph[shortestDistanceNode]);
      console.log("BDJHD" + graph[startNode][0]);
      for(let neighbor in graph[shortestDistanceNode]) {
          let distanceThroughNode = distances[shortestDistanceNode] + graph[shortestDistanceNode][neighbor];
          console.log("Blah" + graph[shortestDistanceNode][neighbor]);

          if (shortestDistanceNode === endNode) {
            distances[neighbor] = distanceThroughNode;
              previous[neighbor] = shortestDistanceNode;
              break;
          }
          if(distanceThroughNode < distances[neighbor]) {
              distances[neighbor] = distanceThroughNode;
              previous[neighbor] = shortestDistanceNode;
              queue.enqueue(neighbor, distances[neighbor]);
          }
      }
  }

  return { distances, previous };
}

function getPath(previous, endNode) {
  let path = [];
  let currentNode = endNode;

  while(currentNode !== null) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
  }

  return path;
}


/*const result = dijkstra(response.data, startLocation, endLocation);
console.log('Result from dijkstra:', result);

const shortestPath = getPath(result.previous, endLocation, response.data);
console.log('Shortest Path:', shortestPath);

const totalWeight = result.distances[endLocation];
console.log('Total Weight:', totalWeight);

const pathCoordinates = shortestPath.map(node => ({ lat: node.lat, lng: node.lng }));
 // Coordinates for New York City*/
const containerStyle = {
  width: '100vw',
  height: '100vh'
};
const [startLocation, setStartLocation] = useState(null);
const [endLocation, setEndLocation] = useState(null);
const [markers, setMarkers] = useState([]);
const [start1, setStart1] = useState(null);
const [end1, setEnd1] = useState(null);

let zoom = 10; // Default zoom level

if (startLocation && endLocation) {
  const distance = getDistance(startLocation, endLocation);
  if (distance < 1000) {
    zoom = 14;
  } else if (distance < 5000) {
    zoom = 13;
  } else if (distance < 10000) {
    zoom = 12;
  } else {
    zoom = 10;
  }
}

/*function onPlacesChanged(setLocation, setMarkers) {
  return function() {
    const places = this.getPlaces();
    const location = {
      lat: places[0].geometry.location.lat(),
      lng: places[0].geometry.location.lng(),
    };
    console.log(location); // Log the selected place's details
    setLocation(location);
    setMarkers(prev => [...prev, location]);
  };
}*/
/*function resetLocations() {
  setStartLocation(null);
  setEndLocation(null);
  setMarkers([]);
}*/
  return (
   /* <div className='App'>
        <LoadScript
      libraries={["places"]}
      googleMapsApiKey="AIzaSyA29P_0zghPIM_WkO10guIwiV1R9PdyDPA"
    >
      <div className = "controls">
      <StandaloneSearchBox
  onLoad={ref => ref.setBounds(new window.google.maps.LatLngBounds().extend(center))}
  onPlacesChanged={onPlacesChanged(setStartLocation, setMarkers)}
>
  <input type="text" placeholder="Enter Starting Point" />
</StandaloneSearchBox>
<StandaloneSearchBox
  onLoad={ref => ref.setBounds(new window.google.maps.LatLngBounds().extend(center))}
  onPlacesChanged={onPlacesChanged(setEndLocation, setMarkers)}
>
  <input type="text" placeholder="Enter Ending Point" />
</StandaloneSearchBox>
<button onClick={resetLocations}>Reset</button>
      </div>
      <GoogleMap className="GoogleMap"
  mapContainerStyle={containerStyle}
  center={markers.length > 0 ? markers[0] : center}
  zoom={zoom}
>
  {markers.length >= 2 && (
    <Polyline
      path={markers}
      options={{ strokeColor: "black", strokeWeight: "2", strokeOpacity: "1", geodesic: "true"}}
    />
  )}
  {markers.map((marker, index) => (
    <Marker key={index} position={marker} />
  ))}
</GoogleMap>
    </LoadScript>
  </div>*/
  <div className='App'>
      <LoadScript googleMapsApiKey="AIzaSyA29P_0zghPIM_WkO10guIwiV1R9PdyDPA" libraries={libraries}>
        <div className='controls'>
        <StandaloneSearchBox onLoad={ref => startBox.current = ref} onPlacesChanged={() => onPlacesChanged(startBox)}>
          <input type="text" placeholder="Enter Start Point" />
        </StandaloneSearchBox>
        <StandaloneSearchBox onLoad={ref => endBox.current = ref} onPlacesChanged={() => onPlacesChanged(endBox)}>
          <input type="text" placeholder="Enter Destination" />
        </StandaloneSearchBox>
        <button onClick={resetLocations}>Reset</button>
        </div>
        <GoogleMap className="GoogleMap"
          mapContainerStyle={containerStyle}
          center={markers.length > 0 ? markers[0] : center}
          zoom={zoom}
          onClick={onMapClick}
        >
          {markers.length >= 2 && (
            <Polyline
              path={pathCoordinates}
              options={{ strokeColor: "black", strokeWeight: "2", strokeOpacity: "1", geodesic: "true"}}
            />
          )}
          {markers.map((marker, index) => (
            <Marker key={index} position={marker} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
    
  );
}

export default App;