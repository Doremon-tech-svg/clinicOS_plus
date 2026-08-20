import { useEffect, useRef, useCallback } from 'react';
import { Loader2, Navigation } from 'lucide-react';
import { HOSPITAL } from './constants';

export default function LiveMap({ ambulancePos, gpsETA }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const ambMarkerRef    = useRef(null);
  const routeLineRef    = useRef(null);

  const initMap = useCallback(() => {
    if (mapRef.current || !mapContainerRef.current || !window.L) return;
    const L   = window.L;
    const map = L.map(mapContainerRef.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: false })
      .setView([HOSPITAL.lat, HOSPITAL.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);
    const hIcon = L.divIcon({
      className: '',
      html: `<div style="background:#bc000c;color:#fff;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.35)">🏥 ${HOSPITAL.name}</div>`,
      iconAnchor: [55, 10],
    });
    L.marker([HOSPITAL.lat, HOSPITAL.lng], { icon: hIcon }).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (window.L) { initMap(); }
    else if (!document.getElementById('leaflet-js')) {
      const s = document.createElement('script');
      s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = initMap; document.head.appendChild(s);
    }
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; ambMarkerRef.current = null; routeLineRef.current = null; } };
  }, [initMap]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !ambulancePos) return;
    const aIcon = L.divIcon({
      className: '',
      html: `<div style="background:#1a73e8;color:#fff;padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,.35)">🚑 Ambulance</div>`,
      iconAnchor: [45, 10],
    });
    if (ambMarkerRef.current) { ambMarkerRef.current.setLatLng([ambulancePos.lat, ambulancePos.lng]); }
    else { ambMarkerRef.current = L.marker([ambulancePos.lat, ambulancePos.lng], { icon: aIcon }).addTo(mapRef.current); }
    const latlngs = [[ambulancePos.lat, ambulancePos.lng], [HOSPITAL.lat, HOSPITAL.lng]];
    if (routeLineRef.current) { routeLineRef.current.setLatLngs(latlngs); }
    else { routeLineRef.current = L.polyline(latlngs, { color: '#bc000c', weight: 3, opacity: 0.75, dashArray: '8 6' }).addTo(mapRef.current); }
    mapRef.current.fitBounds(latlngs, { padding: [40, 40] });
  }, [ambulancePos]);

  return (
    <div className="glass ghost-border relative overflow-hidden rounded-2xl" style={{ height: 280 }}>
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/80 px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
        Live · {HOSPITAL.name}
      </div>
      {gpsETA !== null && (
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-lg bg-[#bc000c] px-4 py-2 font-black tracking-tight text-white text-sm">
          ETA {gpsETA.toFixed(1)} min
        </div>
      )}
      {ambulancePos && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded bg-white/90 px-3 py-1 text-[10px] font-bold text-slate-700 flex items-center gap-1">
          <Navigation className="h-3 w-3 text-blue-600" />
          {ambulancePos.lat.toFixed(4)}, {ambulancePos.lng.toFixed(4)}
        </div>
      )}
      {!ambulancePos && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/30">
          <div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-[#bc000c]" /><p className="mt-1 text-xs font-bold text-slate-500">Acquiring GPS…</p></div>
        </div>
      )}
    </div>
  );
}
