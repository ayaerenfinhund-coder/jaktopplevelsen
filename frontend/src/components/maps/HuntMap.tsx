import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Track } from '../../types';

interface HuntMapProps {
  tracks: Track[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  animationTime?: number; // 0-100 prosent for animasjon
}

// Komponent for å tilpasse kartvisningen til sporene
function MapBoundsUpdater({ tracks }: { tracks: Track[] }) {
  const map = useMap();

  useEffect(() => {
    if (tracks.length === 0) return;

    // Beregn bounds fra alle spor
    let allCoords: [number, number][] = [];
    tracks.forEach((track) => {
      track.geojson.coordinates.forEach((coord) => {
        allCoords.push([coord[1], coord[0]]); // Leaflet bruker [lat, lng]
      });
    });

    if (allCoords.length > 0) {
      const bounds = new LatLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tracks, map]);

  return null;
}

export default function HuntMap({
  tracks,
  center = [62.0, 10.0],
  zoom = 12,
  showControls = true,
  animationTime = 100,
}: HuntMapProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  // Beregn synlige punkter basert på animasjonstid
  const getVisibleCoordinates = (track: Track) => {
    if (animationTime >= 100) {
      return track.geojson.coordinates.map((c) => [c[1], c[0]] as [number, number]);
    }

    const totalPoints = track.geojson.coordinates.length;
    const visibleCount = Math.floor((animationTime / 100) * totalPoints);
    return track.geojson.coordinates
      .slice(0, visibleCount)
      .map((c) => [c[1], c[0]] as [number, number]);
  };

  // Hent siste posisjon for markør
  const getLastPosition = (track: Track): [number, number] | null => {
    const coords = getVisibleCoordinates(track);
    if (coords.length === 0) return null;
    return coords[coords.length - 1];
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={showControls}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Kartdata: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        />

        {/* Tegn spor */}
        {tracks.map((track) => {
          const positions = getVisibleCoordinates(track);
          const lastPos = getLastPosition(track);

          return (
            <div key={track.id}>
              <Polyline
                positions={positions}
                pathOptions={{
                  color: track.color,
                  weight: 4,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => setSelectedTrack(track),
                }}
              />

              {/* Markør for nåværende posisjon */}
              {lastPos && animationTime < 100 && (
                <Marker position={lastPos}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{track.name}</strong>
                      <br />
                      {Math.round(animationTime)}% fullført
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}

        <MapBoundsUpdater tracks={tracks} />
      </MapContainer>

      {/* Spor-info panel */}
      {selectedTrack && (
        <div className="absolute bottom-4 left-4 right-4 bg-background-light/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedTrack.color }}
            />
            <h4 className="font-semibold text-text-primary">
              {selectedTrack.name}
            </h4>
            <button
              onClick={() => setSelectedTrack(null)}
              className="ml-auto text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-muted">Distanse:</span>
              <br />
              <span className="text-text-primary font-medium">
                {selectedTrack.statistics.distance_km} km
              </span>
            </div>
            <div>
              <span className="text-text-muted">Varighet:</span>
              <br />
              <span className="text-text-primary font-medium">
                {Math.round(selectedTrack.statistics.duration_minutes)} min
              </span>
            </div>
            <div>
              <span className="text-text-muted">Snittfart:</span>
              <br />
              <span className="text-text-primary font-medium">
                {selectedTrack.statistics.avg_speed_kmh} km/t
              </span>
            </div>
            <div>
              <span className="text-text-muted">Høydemeter:</span>
              <br />
              <span className="text-text-primary font-medium">
                ↑{selectedTrack.statistics.elevation_gain_m}m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legende */}
      {tracks.length > 1 && (
        <div className="absolute top-4 right-4 bg-background-light/95 backdrop-blur-sm p-3 rounded-lg shadow-lg">
          <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">
            Spor
          </h4>
          <div className="space-y-1">
            {tracks.map((track) => (
              <div key={track.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm text-text-primary">
                  {track.name.split(' - ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
