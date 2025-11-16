import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
  LayersControl,
  WMSTileLayer,
  ScaleControl,
} from 'react-leaflet';
import { LatLngBounds, Icon } from 'leaflet';
import { Layers, MapPin, Mountain, Trees, Home } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Track } from '../../types';

// Fix for default marker icon
const dogIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4752E" stroke="#fff" stroke-width="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8c-2 0-3.5 1.5-3.5 3.5 0 1.5 1 2.5 2 3v1.5h3v-1.5c1-.5 2-1.5 2-3C15.5 9.5 14 8 12 8z" fill="#fff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface HuntMapProps {
  tracks: Track[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  animationTime?: number;
}

// Komponent for å tilpasse kartvisningen til sporene
function MapBoundsUpdater({ tracks }: { tracks: Track[] }) {
  const map = useMap();

  useEffect(() => {
    if (tracks.length === 0) return;

    let allCoords: [number, number][] = [];
    tracks.forEach((track) => {
      track.geojson.coordinates.forEach((coord) => {
        allCoords.push([coord[1], coord[0]]);
      });
    });

    if (allCoords.length > 0) {
      const bounds = new LatLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tracks, map]);

  return null;
}

// Beste kartkilder for jakt - detaljerte topografiske kart
const MAP_LAYERS = {
  // OpenTopoMap - detaljert topografisk (fungerer best)
  openTopo: {
    name: 'Topografisk (Detaljert)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
  },
  // CyclOSM - svært detaljert med stier og høydelinjer
  cyclOSM: {
    name: 'Terreng & Stier',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.cyclosm.org">CyclOSM</a> | OSM',
    maxZoom: 20,
  },
  // Kartverket Topografisk
  norgeskart: {
    name: 'Norgeskart',
    url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
    attribution: '© <a href="https://kartverket.no">Kartverket</a>',
    maxZoom: 18,
  },
  // OpenStreetMap standard for referanse
  osm: {
    name: 'Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  // Satellitt fra ESRI (fungerer uten API-nøkkel)
  satellite: {
    name: 'Satellitt',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
};

// WMS overlays - tilleggsinfo
const WMS_OVERLAYS = {
  eiendom: {
    name: 'Eiendomsgrenser',
    url: 'https://wms.geonorge.no/skwms1/wms.matrikkelkart',
    layers: 'matrikkelkart',
  },
  markslag: {
    name: 'Markslag (skog/myr)',
    url: 'https://wms.nibio.no/cgi-bin/ar5',
    layers: 'Arealtype',
  },
};

export default function HuntMap({
  tracks,
  center = [62.0, 10.0],
  zoom = 12,
  showControls = true,
  animationTime = 100,
}: HuntMapProps) {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showPropertyBoundaries, setShowPropertyBoundaries] = useState(false);
  const [showLandUse, setShowLandUse] = useState(false);

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
        attributionControl={true}
      >
        {/* Kartlag - OpenTopoMap som standard (beste detalj) */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={MAP_LAYERS.openTopo.name}>
            <TileLayer
              url={MAP_LAYERS.openTopo.url}
              attribution={MAP_LAYERS.openTopo.attribution}
              maxZoom={MAP_LAYERS.openTopo.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name={MAP_LAYERS.cyclOSM.name}>
            <TileLayer
              url={MAP_LAYERS.cyclOSM.url}
              attribution={MAP_LAYERS.cyclOSM.attribution}
              maxZoom={MAP_LAYERS.cyclOSM.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name={MAP_LAYERS.norgeskart.name}>
            <TileLayer
              url={MAP_LAYERS.norgeskart.url}
              attribution={MAP_LAYERS.norgeskart.attribution}
              maxZoom={MAP_LAYERS.norgeskart.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name={MAP_LAYERS.osm.name}>
            <TileLayer
              url={MAP_LAYERS.osm.url}
              attribution={MAP_LAYERS.osm.attribution}
              maxZoom={MAP_LAYERS.osm.maxZoom}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name={MAP_LAYERS.satellite.name}>
            <TileLayer
              url={MAP_LAYERS.satellite.url}
              attribution={MAP_LAYERS.satellite.attribution}
              maxZoom={MAP_LAYERS.satellite.maxZoom}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Eiendomsgrenser WMS */}
        {showPropertyBoundaries && (
          <WMSTileLayer
            url={WMS_OVERLAYS.eiendom.url}
            layers={WMS_OVERLAYS.eiendom.layers}
            format="image/png"
            transparent={true}
            opacity={0.6}
          />
        )}

        {/* Markslag WMS */}
        {showLandUse && (
          <WMSTileLayer
            url={WMS_OVERLAYS.markslag.url}
            layers={WMS_OVERLAYS.markslag.layers}
            format="image/png"
            transparent={true}
            opacity={0.4}
          />
        )}

        {/* Tegn GPS-spor */}
        {tracks.map((track) => {
          const positions = getVisibleCoordinates(track);
          const lastPos = getLastPosition(track);

          return (
            <div key={track.id}>
              {/* Sporskygge for dybde */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: '#000',
                  weight: 7,
                  opacity: 0.3,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Hovedspor */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: track.color,
                  weight: 5,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
                eventHandlers={{
                  click: () => setSelectedTrack(track),
                }}
              />

              {/* Startpunkt */}
              {positions.length > 0 && (
                <Marker position={positions[0]} icon={dogIcon}>
                  <Popup>
                    <div className="text-sm font-medium">
                      Start: {track.name.split(' - ')[0]}
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Nåværende posisjon ved animasjon */}
              {lastPos && animationTime < 100 && (
                <Marker position={lastPos} icon={dogIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{track.name.split(' - ')[0]}</strong>
                      <br />
                      {Math.round(animationTime)}% av sporet
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}

        <MapBoundsUpdater tracks={tracks} />
        <ScaleControl position="bottomleft" imperial={false} />
      </MapContainer>

      {/* Kartlag-kontroller */}
      <div className="absolute top-4 left-4 bg-background-light/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="text-xs font-semibold text-text-muted uppercase mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Tilleggsinfo
        </h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showPropertyBoundaries}
              onChange={(e) => setShowPropertyBoundaries(e.target.checked)}
              className="checkbox"
            />
            <Home className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary">Eiendomsgrenser</span>
          </label>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showLandUse}
              onChange={(e) => setShowLandUse(e.target.checked)}
              className="checkbox"
            />
            <Trees className="w-4 h-4 text-text-muted" />
            <span className="text-text-primary">Markslag (skog/myr)</span>
          </label>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Bytt kart: ikon øverst til høyre
        </p>
      </div>

      {/* Sporinfo panel */}
      {selectedTrack && (
        <div className="absolute bottom-4 left-4 right-4 bg-background-light/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md z-[1000]">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-5 h-5 rounded-full shadow-glow"
              style={{ backgroundColor: selectedTrack.color }}
            />
            <h4 className="font-semibold text-text-primary text-lg">
              {selectedTrack.name.split(' - ')[0]}
            </h4>
            <button
              onClick={() => setSelectedTrack(null)}
              className="ml-auto btn-ghost btn-icon-sm"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-background p-2 rounded">
              <span className="text-text-muted text-xs block">Distanse</span>
              <span className="text-text-primary font-semibold">
                {selectedTrack.statistics.distance_km} km
              </span>
            </div>
            <div className="bg-background p-2 rounded">
              <span className="text-text-muted text-xs block">Varighet</span>
              <span className="text-text-primary font-semibold">
                {Math.round(selectedTrack.statistics.duration_minutes)} min
              </span>
            </div>
            <div className="bg-background p-2 rounded">
              <span className="text-text-muted text-xs block">Snittfart</span>
              <span className="text-text-primary font-semibold">
                {selectedTrack.statistics.avg_speed_kmh} km/t
              </span>
            </div>
            <div className="bg-background p-2 rounded">
              <span className="text-text-muted text-xs block">Høydemeter</span>
              <span className="text-text-primary font-semibold">
                ↑{selectedTrack.statistics.elevation_gain_m}m ↓
                {selectedTrack.statistics.elevation_loss_m}m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legende for flere spor */}
      {tracks.length > 1 && (
        <div className="absolute top-4 right-16 bg-background-light/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000]">
          <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">
            Hundespor
          </h4>
          <div className="space-y-1">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className="flex items-center gap-2 w-full hover:bg-background-lighter p-1 rounded transition-colors"
              >
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-sm text-text-primary">
                  {track.name.split(' - ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kartinfo */}
      <div className="absolute bottom-4 right-4 bg-background-light/90 backdrop-blur-sm px-3 py-2 rounded shadow-lg text-xs text-text-muted z-[1000]">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          <span>Norges offisielle kartdata fra Kartverket</span>
        </div>
      </div>
    </div>
  );
}
