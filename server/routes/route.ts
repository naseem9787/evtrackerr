import { RequestHandler } from 'express';
import { RouteRequest, RouteResponse } from '../../shared/api';
import { STATIONS } from './stations';
import { buildGraph, dijkstra } from '../../shared/dijkstra';

// Demo origin: approximate central city point
const DEFAULT_ORIGIN = { id: 'origin', lat: 12.9716, lng: 77.5946 };

export const handleRoute: RequestHandler = (req, res) => {
  const body = req.body as RouteRequest;
  const destinationId = body.destinationId;

  if (!destinationId) {
    return res.status(400).json({ error: 'destinationId is required' });
  }

  const dest = STATIONS.find((s) => s.id === destinationId);
  if (!dest) {
    return res.status(404).json({ error: 'destination not found' });
  }

  const origin = body.origin ? { id: 'origin', lat: body.origin.lat, lng: body.origin.lng } : DEFAULT_ORIGIN;

  const graph = buildGraph(STATIONS, origin);
  const result = dijkstra(graph, origin.id, destinationId);

  const response: RouteResponse = {
    path: result.path,
    distanceKm: Number(result.distanceKm.toFixed(2)),
  };
  res.status(200).json(response);
};
