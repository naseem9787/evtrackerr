import { RequestHandler } from 'express';
import { Station, StationsResponse } from '../../shared/api';

export const STATIONS: Station[] = [
  {
    id: 'chargehub-mg',
    name: 'ChargeHub - MG Road',
    type: 'Fast',
    ports: 4,
    lat: 12.9716,
    lng: 77.5946,
    available: true,
  },
  {
    id: 'greencharge-park',
    name: 'GreenCharge - Central Park',
    type: 'Normal',
    ports: 2,
    lat: 12.975,
    lng: 77.6,
    available: true,
  },
  {
    id: 'powerstop-riverside',
    name: 'PowerStop - Riverside',
    type: 'Slow',
    ports: 6,
    lat: 12.98,
    lng: 77.61,
    available: true,
  },
];

export const handleGetStations: RequestHandler = (_req, res) => {
  const response: StationsResponse = { stations: STATIONS };
  res.status(200).json(response);
};
