import { useState, useEffect, useRef, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, FullscreenControl, ScaleControl, Marker } from 'react-map-gl';
import { Maximize2, Minimize2, Ruler, Flame, X, Layers as LayersIcon } from 'lucide-react';
import type { Track } from '../../types';
import type { MapRef, LayerProps } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface HuntMapProps {
  tracks: Track[];
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
  animationTime?: number;
  initialHeight?: 'small' | 'medium' | 'large';
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function HuntMap({
  tracks,
  center = [10.0, 62.0],
  zoom = 12,
  showControls = true,
  animationTime = 100,
  initialHeight = 'small',
}: HuntMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapHeight, setMapHeight] = useState<'small' | 'medium' | 'large'>(initialHeight);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
  const [show3DTerrain, setShow3DTerrain] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Map tools
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);

  const heightClasses = {
    small: 'h-[300px]',
    medium: 'h-[450px]',
    large: 'h-[600px]',
  };

  const cycleHeight = () => {
    if (mapHeight === 'small') setMapHeight('medium');
    else if (mapHeight === 'medium') setMapHeight('large');
    else setMapHeight('small');
  };

  const mapStyles = [
    { id: 'outdoors-v12', name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12' },
    { id: 'satellite-streets-v12', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' },
    { id: 'light-v11', name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
    { id: 'dark-v11', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  ];

  // Fit bounds when tracks change
  useEffect(() => {
    if (!mapRef.current || tracks.length === 0) return;

    const allCoords: [number, number][] = [];
    tracks.forEach((track) => {
      track.geojson.coordinates.forEach((coord) => {
        allCoords.push([coord[0], coord[1]]);
      });
    });

    if (allCoords.length > 0) {
      const lngs = allCoords.map((c) => c[0]);
      const lats = allCoords.map((c) => c[1]);
      const bounds: [[number, number], [number, number]] = [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ];

      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
    }
  }, [tracks]);

  // Enable 3D terrain
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();

    if (show3DTerrain) {
      map.once('style.load', () => {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      });
    } else {
      map.setTerrain(null);
    }
  }, [show3DTerrain, mapStyle]);

  // Generate track GeoJSON with animation
  const getVisibleTrackGeoJSON = (track: Track) => {
    if (animationTime >= 100) {
      return track.geojson;
    }

    const totalPoints = track.geojson.coordinates.length;
    const visibleCount = Math.floor((animationTime / 100) * totalPoints);

    return {
      type: 'LineString' as const,
      coordinates: track.geojson.coordinates.slice(0, visibleCount),
    };
  };

  const getLastPosition = (track: Track): [number, number] | null => {
    const geojson = getVisibleTrackGeoJSON(track);
    if (geojson.coordinates.length === 0) return null;
    const coord = geojson.coordinates[geojson.coordinates.length - 1];
    return [coord[0], coord[1]];
  };

  // Track layers
  const trackLayers: JSX.Element[] = useMemo(() => {
    return tracks.flatMap((track) => {
      const geojson = getVisibleTrackGeoJSON(track);
      const lastPos = getLastPosition(track);

      return [
        // Shadow line for depth
        <Source key={`${track.id}-shadow-source`} type="geojson" data={geojson}>
          <Layer
            id={`${track.id}-shadow`}
            type="line"
            paint={{
              'line-color': '#000',
              'line-width': 7,
              'line-opacity': 0.3,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </Source>,
        // Main track line
        <Source key={`${track.id}-source`} type="geojson" data={geojson}>
          <Layer
            id={track.id}
            type="line"
            paint={{
              'line-color': track.color,
              'line-width': 5,
              'line-opacity': 0.9,
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </Source>,
        // Current position marker during animation
        lastPos && animationTime < 100 ? (
          <Marker
            key={`${track.id}-marker`}
            longitude={lastPos[0]}
            latitude={lastPos[1]}
          >
            <div
              className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: track.color }}
            >
              {track.name.charAt(0)}
            </div>
          </Marker>
        ) : null,
      ].filter(Boolean) as JSX.Element[];
    });
  }, [tracks, animationTime]);

  // Measurement tool
  const handleMapClick = (event: any) => {
    if (!isMeasuring) return;

    const { lngLat } = event;
    const newPoints = [...measurePoints, [lngLat.lng, lngLat.lat] as [number, number]];
    setMeasurePoints(newPoints);

    if (newPoints.length >= 2) {
      const distance = calculateDistance(newPoints);
      setMeasuredDistance(distance);
    }
  };

  const calculateDistance = (points: [number, number][]): number => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      const [lng1, lat1] = points[i - 1];
      const [lng2, lat2] = points[i];

      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  };

  const measurementGeoJSON = useMemo(() => {
    if (measurePoints.length === 0) return null;
    return {
      type: 'LineString' as const,
      coordinates: measurePoints,
    };
  }, [measurePoints]);

  return (
    <div className={`relative w-full ${heightClasses[mapHeight]} transition-all duration-300`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center[1],
          latitude: center[0],
          zoom: zoom,
          pitch: show3DTerrain ? 45 : 0,
          bearing: 0,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        terrain={show3DTerrain ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
        onClick={handleMapClick}
      >
        {/* 3D terrain source */}
        {show3DTerrain && (
          <Source
            id="mapbox-dem"
            type="raster-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            tileSize={512}
            maxzoom={14}
          />
        )}

        {/* Track layers */}
        {trackLayers}

        {/* Measurement line */}
        {measurementGeoJSON && (
          <Source type="geojson" data={measurementGeoJSON}>
            <Layer
              id="measurement-line"
              type="line"
              paint={{
                'line-color': '#FF6B6B',
                'line-width': 3,
                'line-dasharray': [2, 2],
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}

        {/* Measurement points */}
        {measurePoints.map((point, i) => (
          <Marker key={i} longitude={point[0]} latitude={point[1]}>
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </Marker>
        ))}

        {/* Controls */}
        {showControls && (
          <>
            <NavigationControl position="top-right" showCompass showZoom visualizePitch />
            <FullscreenControl position="top-right" />
            <ScaleControl position="bottom-left" />
          </>
        )}
      </Map>

      {/* Layer selector */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-background-light/90 backdrop-blur-sm rounded-lg shadow-lg">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="p-2 flex items-center gap-2 text-text-primary hover:bg-background-lighter rounded-lg transition-colors"
          >
            <LayersIcon className="w-4 h-4" />
            <span className="text-sm">Lag</span>
          </button>

          {showLayerMenu && (
            <div className="mt-2 p-2 space-y-2 min-w-[150px]">
              {mapStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setMapStyle(style.url);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    mapStyle === style.url
                      ? 'bg-primary-500 text-white'
                      : 'text-text-primary hover:bg-background-lighter'
                  }`}
                >
                  {style.name}
                </button>
              ))}
              <div className="border-t border-background-lighter pt-2">
                <label className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-background-lighter rounded">
                  <input
                    type="checkbox"
                    checked={show3DTerrain}
                    onChange={(e) => setShow3DTerrain(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-text-primary">3D Terreng</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map tools */}
      <div className="absolute top-16 left-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => {
            setIsMeasuring(!isMeasuring);
            if (isMeasuring) {
              setMeasuredDistance(null);
              setMeasurePoints([]);
            }
          }}
          className={`p-2 rounded shadow transition-colors ${
            isMeasuring
              ? 'bg-accent-500 text-white'
              : 'bg-background-light/90 backdrop-blur-sm text-text-muted hover:text-text-primary'
          }`}
          title="Mål avstand"
        >
          <Ruler className="w-4 h-4" />
        </button>
      </div>

      {/* Measurement result */}
      {isMeasuring && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          <span className="text-sm font-medium">
            {measuredDistance !== null
              ? `${measuredDistance.toFixed(2)} km`
              : 'Klikk for å måle avstand'}
          </span>
          <button
            onClick={() => {
              setIsMeasuring(false);
              setMeasuredDistance(null);
              setMeasurePoints([]);
            }}
            className="ml-2 hover:bg-white/20 p-1 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Track info panel */}
      {selectedTrack && (
        <div className="absolute bottom-4 left-4 right-4 bg-background-light/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-md z-10">
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

      {/* Track legend */}
      {tracks.length > 1 && (
        <div className="absolute top-4 right-16 bg-background-light/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
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

      {/* Size control */}
      <button
        onClick={cycleHeight}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background-light/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2 hover:bg-background-lighter transition-colors"
        title={mapHeight === 'large' ? 'Gjør kartet mindre' : 'Gjør kartet større'}
      >
        {mapHeight === 'large' ? (
          <Minimize2 className="w-4 h-4 text-text-muted" />
        ) : (
          <Maximize2 className="w-4 h-4 text-text-muted" />
        )}
        <span className="text-sm text-text-primary">
          {mapHeight === 'small' ? 'Større kart' : mapHeight === 'medium' ? 'Fullskjerm' : 'Mindre kart'}
        </span>
      </button>
    </div>
  );
}
