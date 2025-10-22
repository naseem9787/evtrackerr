export interface GraphNode {
  id: string;
  neighbors: { id: string; distanceKm: number }[];
}

// Haversine distance in kilometers
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface DijkstraResult {
  distanceKm: number;
  path: string[];
}

export function dijkstra(
  graph: Map<string, GraphNode>,
  start: string,
  end: string
): DijkstraResult {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const k of graph.keys()) {
    dist.set(k, Infinity);
    prev.set(k, null);
    unvisited.add(k);
  }
  dist.set(start, 0);

  while (unvisited.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of unvisited) {
      const v = dist.get(id)!;
      if (v < best) {
        best = v;
        u = id;
      }
    }
    if (u == null || u === end) break;
    unvisited.delete(u);
    const node = graph.get(u);
    if (!node) continue;
    for (const { id: vId, distanceKm } of node.neighbors) {
      if (!unvisited.has(vId)) continue;
      const alt = best + distanceKm;
      if (alt < (dist.get(vId) ?? Infinity)) {
        dist.set(vId, alt);
        prev.set(vId, u);
      }
    }
  }

  // Reconstruct
  const path: string[] = [];
  let cur: string | null = end;
  if (!isFinite(dist.get(end) ?? Infinity)) {
    return { distanceKm: Infinity, path };
  }
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }

  return { distanceKm: dist.get(end) ?? Infinity, path };
}

export interface StationLike { id: string; lat: number; lng: number }

export function buildGraph(nodes: StationLike[], extraStart?: StationLike): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();
  const all = extraStart ? [extraStart, ...nodes] : [...nodes];
  for (const n of all) {
    graph.set(n.id, { id: n.id, neighbors: [] });
  }
  for (const a of all) {
    const node = graph.get(a.id)!;
    for (const b of all) {
      if (a.id === b.id) continue;
      node.neighbors.push({ id: b.id, distanceKm: haversineKm(a.lat, a.lng, b.lat, b.lng) });
    }
  }
  return graph;
}
