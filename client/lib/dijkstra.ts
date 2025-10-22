export interface Station {
  id: string;
  name: string;
  type: 'Fast' | 'Normal' | 'Slow';
  ports: number;
  distance: number;
  lat: number;
  lng: number;
  available: boolean;
}

export interface GraphNode {
  id: string;
  neighbors: { id: string; distance: number }[];
}

export interface DijkstraResult {
  distance: number;
  path: string[];
}

export function dijkstra(
  graph: Map<string, GraphNode>,
  start: string,
  end: string
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  // Initialize
  for (const [nodeId] of graph) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }
  distances.set(start, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDistance = Infinity;
    
    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId) || Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    }

    if (!current || current === end) break;

    unvisited.delete(current);

    const currentNode = graph.get(current);
    if (!currentNode) continue;

    const currentDistance = distances.get(current) || 0;

    // Update neighbors
    for (const neighbor of currentNode.neighbors) {
      if (!unvisited.has(neighbor.id)) continue;

      const newDistance = currentDistance + neighbor.distance;
      const oldDistance = distances.get(neighbor.id) || Infinity;

      if (newDistance < oldDistance) {
        distances.set(neighbor.id, newDistance);
        previous.set(neighbor.id, current);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = end;
  
  while (current) {
    path.unshift(current);
    current = previous.get(current) || null;
    if (current === start) {
      path.unshift(start);
      break;
    }
  }

  return {
    distance: distances.get(end) || Infinity,
    path,
  };
}

export function buildStationGraph(stations: Station[]): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Add all stations as nodes
  stations.forEach((station) => {
    graph.set(station.id, {
      id: station.id,
      neighbors: [],
    });
  });

  // Connect each station to its nearest neighbors (simplified)
  stations.forEach((station) => {
    const node = graph.get(station.id)!;
    
    stations
      .filter((s) => s.id !== station.id)
      .forEach((otherStation) => {
        const distance = Math.sqrt(
          Math.pow(station.lat - otherStation.lat, 2) +
          Math.pow(station.lng - otherStation.lng, 2)
        );
        
        node.neighbors.push({
          id: otherStation.id,
          distance,
        });
      });
  });

  return graph;
}
