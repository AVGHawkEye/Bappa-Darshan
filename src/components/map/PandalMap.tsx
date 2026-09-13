import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Pandal } from '../../types';
import { ENV_CONFIG } from '../../config/env';
import { Crosshair, ShieldCheck, Clock, MapPin, Eye } from 'lucide-react';
import { AccuracyBadge } from '../common/AccuracyBadge';

interface PandalMapProps {
  pandals: Pandal[];
  selectedPandalId?: string;
  onSelectPandal: (pandal: Pandal) => void;
  onMarkVisit: (pandal: Pandal, coords: { lat: number; lng: number; accuracy: number }) => void;
  userCoords?: { lat: number; lng: number; accuracy: number };
}

export const PandalMap: React.FC<PandalMapProps> = ({
  pandals,
  selectedPandalId,
  onSelectPandal,
  onMarkVisit,
  userCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [currentGps, setCurrentGps] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  }>(
    userCoords || {
      lat: 19.2142,
      lng: 72.826,
      accuracy: 12, // default simulated high accuracy within Auto-Accept (0-15m)
    }
  );

  const [isLocating, setIsLocating] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const { DEFAULT_CENTER } = ENV_CONFIG.PILOT_ZONE;

    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude],
      zoom: DEFAULT_CENTER.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Student-friendly, low-cost OpenStreetMap tiles (CartoDB Dark Matter / OSM style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Pandal Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    pandals.forEach((pandal) => {
      const isSelected = pandal.id === selectedPandalId;

      // Custom HTML Marker
      const iconHtml = `
        <div class="relative cursor-pointer transition-transform transform ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110'
        }">
          <div class="w-8 h-8 rounded-full shadow-md flex items-center justify-center font-bold text-xs border-2 ${
            isSelected
              ? 'bg-amber-500 text-white border-white shadow-amber-500/50'
              : 'bg-orange-600 text-white border-amber-200'
          }">
            ॐ
          </div>
          ${
            isSelected
              ? '<span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rotate-45"></span>'
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-pandal-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([pandal.verifiedLatitude, pandal.verifiedLongitude], {
        icon: customIcon,
      });

      marker.on('click', () => {
        onSelectPandal(pandal);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [pandals, selectedPandalId, onSelectPandal]);

  // Update User Location Marker & Accuracy Ring (Rule 1 & Rule 2)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
    }

    const userHtml = `
      <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50 animate-pulse"></div>
    `;
    const userIcon = L.divIcon({
      html: userHtml,
      className: 'user-gps-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker([currentGps.lat, currentGps.lng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // Accuracy ring colored by Rule 2 evaluation
    const circleColor =
      currentGps.accuracy <= 15
        ? '#10b981'
        : currentGps.accuracy <= 50
        ? '#f59e0b'
        : '#ef4444';

    userCircleRef.current = L.circle([currentGps.lat, currentGps.lng], {
      radius: currentGps.accuracy,
      color: circleColor,
      fillColor: circleColor,
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(map);
  }, [currentGps]);

  // Handle GPS location trigger
  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const next = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.max(8, Math.round(pos.coords.accuracy)),
          };
          setCurrentGps(next);
          mapInstanceRef.current?.flyTo([next.lat, next.lng], 16, { duration: 1.2 });
        },
        (err) => {
          console.warn('Geolocation failed, falling back to simulated pilot coords:', err);
          setIsLocating(false);
          // Simulated Kandivali location
          const fallback = { lat: 19.2145, lng: 72.8252, accuracy: 10 };
          setCurrentGps(fallback);
          mapInstanceRef.current?.flyTo([fallback.lat, fallback.lng], 16);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const selectedPandal = pandals.find((p) => p.id === selectedPandalId);

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-10 bg-neutral-900" />

      {/* Floating Controls: GPS button and Accuracy badge */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="bg-neutral-900/90 text-neutral-100 p-2.5 rounded-xl border border-neutral-700 shadow-xl backdrop-blur-md active:scale-95 transition-transform flex items-center justify-center hover:bg-neutral-800"
          title="Current GPS Position"
        >
          <Crosshair
            className={`w-5 h-5 ${isLocating ? 'animate-spin text-amber-400' : 'text-amber-400'}`}
          />
        </button>

        <div className="bg-neutral-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-neutral-800 shadow-lg">
          <AccuracyBadge accuracyMeters={currentGps.accuracy} />
        </div>
      </div>

      {/* Selected Pandal Bottom Card Preview */}
      {selectedPandal && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  {selectedPandal.sector || selectedPandal.ward}
                </span>
                <span className="text-xs text-neutral-400">
                  Est. {selectedPandal.establishedYear}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                {selectedPandal.name}
              </h3>
              {selectedPandal.marathiName && (
                <p className="text-xs text-amber-300/80 font-medium">
                  {selectedPandal.marathiName}
                </p>
              )}
            </div>

            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 shrink-0">
              {selectedPandal.crowdLevel?.toUpperCase()} CROWD
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-2.5 border-t border-neutral-800 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Aartis:{' '}
                {selectedPandal.timings.aartis
                  .slice(0, 2)
                  .map((a) => a.time)
                  .join(', ')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onMarkVisit(selectedPandal, currentGps)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-md active:scale-95 transition-all text-xs flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mark Visit Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
