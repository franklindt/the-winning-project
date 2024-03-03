import React, { useState } from 'react';
import { GoogleMap, LoadScript , Polyline , StandaloneSearchBox, Marker } from '@react-google-maps/api';
import './App.css';

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

function App() {
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

    // method to add an element to the queue with priority
    enqueue(element, priority) {
        this.queue.push({element, priority});
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    // method to remove an element from the queue
    dequeue() {
        return this.queue.shift();
    }

    // method to check if the queue is empty
    isEmpty() {
        return !this.queue.length;
    }
}

function dijkstra(graph, start, destination) {
    const distances = {};
    const previous = {};
    const queue = new PriorityQueue();

    // Initialize distances and previous nodes
    for (let node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[start] = 0;

    // Enqueue the start node with priority 0
    queue.enqueue(start, 0);

    while (!queue.isEmpty()) {
        const currentNode = queue.dequeue().element;

        if (currentNode === destination) {
            break;
        }

        for (let neighbor in graph[currentNode].neighbors) {
          const weight = graph[currentNode].neighbors[neighbor].distance;
          const distance = distances[currentNode] + weight;
      
          if (distance < distances[neighbor]) {
              distances[neighbor] = distance;
              previous[neighbor] = currentNode;
              queue.enqueue(neighbor, distance);
          }
      }
    }

    return {
        distances,
        previous
    };
}

function getPath(previous, destination, graph) {
  const path = [];
  let current = destination;

  while (current !== null) {
    if (graph[current]) {
      path.unshift(graph[current].coordinates);
      current = previous[current];
    } else {
      console.error(`Node ${current} is not in the graph`);
      break;
    }
  }

  return path;
}

// Example usage
const graph = {
  1: { 
      coordinates: { lat: 40.7128, lng: -74.0060 },
      neighbors: { 
          2: { distance: 5, coordinates: { lat: 51.5074, lng: -0.1278 } }, 
          3: { distance: 2, coordinates: { lat: 34.0522, lng: -118.2437 } } 
      }
  },
  2: { 
      coordinates: { lat: 51.5074, lng: -0.1278 },
      neighbors: { 
          1: { distance: 5, coordinates: { lat: 40.7128, lng: -74.0060 } }, 
          3: { distance: 1, coordinates: { lat: 34.0522, lng: -118.2437 } }, 
          4: { distance: 3, coordinates: { lat: 35.6895, lng: 139.6917 } } 
      }
  },
  3: { 
      coordinates: { lat: 34.0522, lng: -118.2437 },
      neighbors: { 
          1: { distance: 2, coordinates: { lat: 40.7128, lng: -74.0060 } }, 
          2: { distance: 1, coordinates: { lat: 51.5074, lng: -0.1278 } }, 
          4: { distance: 2, coordinates: { lat: 35.6895, lng: 139.6917 } } 
      }
  },
  4: { 
      coordinates: { lat: 35.6895, lng: 139.6917 },
      neighbors: { 
          2: { distance: 3, coordinates: { lat: 51.5074, lng: -0.1278 } }, 
          3: { distance: 2, coordinates: { lat: 34.0522, lng: -118.2437 } }, 
          5: { distance: 4, coordinates: { lat: 48.8566, lng: 2.3522 } } 
      }
  },
  5: { 
      coordinates: { lat: 48.8566, lng: 2.3522 },
      neighbors: { 
          4: { distance: 4, coordinates: { lat: 35.6895, lng: 139.6917 } } 
      }
  }
};

const startNode = 1;
const destinationNode = 5;

const result = dijkstra(graph, startNode, destinationNode);
console.log('Result from dijkstra:', result);

const shortestPath = getPath(result.previous, destinationNode, graph);
console.log('Shortest Path:', shortestPath);

const totalWeight = result.distances[destinationNode];
console.log('Total Weight:', totalWeight);

const pathCoordinates = shortestPath.map(node => ({ lat: node.lat, lng: node.lng }));

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // Coordinates for New York City
const containerStyle = {
  width: '100vw',
  height: '100vh'
};
const [startLocation, setStartLocation] = useState(null);
const [endLocation, setEndLocation] = useState(null);
const [markers, setMarkers] = useState([]);

function onPlacesChanged(setLocation, setMarkers) {
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
}

function resetLocations() {
  setStartLocation(null);
  setEndLocation(null);
  setMarkers([]);
}
  return (
    <div className='App'>
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
  center={markers.length > 0 ? markers[0] : defaultCenter}
  zoom={10}
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
  </div>
    
  );
}

export default App;
