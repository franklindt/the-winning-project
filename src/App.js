import React, { useRef } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import './App.css';

const containerStyle = {
  width: '400px',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
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

        for (let neighbor in graph[currentNode]) {
            const weight = graph[currentNode][neighbor];
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

function getPath(previous, destination) {
    const path = [];
    let current = destination;

    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return path;
}

// Example usage
const graph = {
    A: { B: 5, C: 2 },
    B: { A: 5, C: 1, D: 3 },
    C: { A: 2, B: 1, D: 1 },
    D: { B: 3, C: 1, E: 2 },
    E: { D: 2 }
};

const startNode = 'A';
const destinationNode = 'E';

const result = dijkstra(graph, startNode, destinationNode);
const shortestPath = getPath(result.previous, destinationNode);
const totalWeight = result.distances[destinationNode];

console.log('Shortest Path:', shortestPath);
console.log('Total Weight:', totalWeight);

const containerStyle = {
  width: '100vw',
  height: '100vh'
};
  return (
    <LoadScript
      googleMapsApiKey="AIzaSyA29P_0zghPIM_WkO10guIwiV1R9PdyDPA"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        { /* You can add markers or other components here */ }
      </GoogleMap>
    </LoadScript>

  );
}

export default App;
