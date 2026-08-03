import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface DirectionsProps {
  origin: string | google.maps.LatLngLiteral | null;
  destination: string | google.maps.LatLngLiteral | null;
}

export function Directions({ origin, destination }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({
      map,
      polylineOptions: {
        strokeColor: '#6366f1',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
      suppressMarkers: true,
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    directionsService
      .route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then(response => {
        directionsRenderer.setDirections(response);
      })
      .catch(error => {
        console.error('Directions request failed', error);
      });

    return () => {
      directionsRenderer.setDirections({ routes: [] });
    }
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
}
