import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Crosshair,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Route,
  Shield,
  AlertOctagon,
} from 'lucide-react';
import { BENGALURU_CENTER } from '../../data/demoData';
import { useSertos } from '../../context/SertosContext';

interface BengaluruTrafficMapProps {
  heightClass?: string;
  focusAmbulanceId?: string;
  showAllAmbulances?: boolean;
}

export const BengaluruTrafficMap: React.FC<BengaluruTrafficMapProps> = ({
  heightClass = 'h-[430px] lg:h-[465px]',
  focusAmbulanceId,
  showAllAmbulances = false,
}) => {
  const {
    appMode,
    ambulances,
    primaryAmbulance,
    alerts,
    policeUnits,
    roadCorridors,
    settings,
    setSelectedAmbulanceId,
  } = useSertos();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const policeLayerRef = useRef<L.LayerGroup | null>(null);
  const incidentLayerRef = useRef<L.LayerGroup | null>(null);
  const ambulanceLayerRef = useRef<L.LayerGroup | null>(null);
  const hospitalLayerRef = useRef<L.LayerGroup | null>(null);

  const [showTraffic, setShowTraffic] = useState(settings.defaultTrafficLayer);
  const [showRoutes, setShowRoutes] = useState(settings.defaultRoutesLayer);
  const [showPolice, setShowPolice] = useState(settings.defaultPoliceLayer);
  const [showIncidents, setShowIncidents] = useState(settings.defaultIncidentsLayer);

  const activeAmb =
    ambulances.find((a) => a.ambulanceId === (focusAmbulanceId || primaryAmbulance.ambulanceId)) ||
    primaryAmbulance;

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: BENGALURU_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    trafficLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    incidentLayerRef.current = L.layerGroup().addTo(map);
    policeLayerRef.current = L.layerGroup().addTo(map);
    hospitalLayerRef.current = L.layerGroup().addTo(map);
    ambulanceLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Traffic Flow Corridors
  useEffect(() => {
    const group = trafficLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showTraffic) return;

    roadCorridors.forEach((road) => {
      const color =
        road.density === 'Smooth'
          ? '#20E39A'
          : road.density === 'Moderate'
          ? '#F59E0B'
          : '#EF4444';

      const line = L.polyline(road.coords, {
        color,
        weight: 4,
        opacity: 0.78,
        lineCap: 'round',
      });

      line.bindPopup(
        `<div class="text-xs space-y-1">
          <div class="font-semibold text-white">${road.name}</div>
          <div class="text-[#94A3B8]">Traffic Flow: <span style="color:${color};font-weight:600">${road.density}</span></div>
          <div class="text-[#94A3B8]">Avg Speed: <span class="text-white font-mono">${road.avgSpeedKmh} km/h</span></div>
        </div>`
      );
      line.addTo(group);
    });
  }, [roadCorridors, showTraffic]);

  // Render Emergency Blue Route & Hospital Markers
  useEffect(() => {
    const routeGroup = routeLayerRef.current;
    const hospitalGroup = hospitalLayerRef.current;
    if (!routeGroup || !hospitalGroup) return;

    routeGroup.clearLayers();
    hospitalGroup.clearLayers();

    const listToRender = showAllAmbulances ? ambulances : [activeAmb];

    if (showRoutes) {
      listToRender.forEach((amb) => {
        const isSelected = amb.ambulanceId === activeAmb.ambulanceId;

        // Outer glow line
        L.polyline(amb.routeWaypoints, {
          color: '#24A8FF',
          weight: isSelected ? 10 : 6,
          opacity: isSelected ? 0.25 : 0.14,
          lineCap: 'round',
          className: 'sertos-route-glow',
        }).addTo(routeGroup);

        // Inner crisp route line
        L.polyline(amb.routeWaypoints, {
          color: isSelected ? '#38BDF8' : '#24A8FF',
          weight: isSelected ? 4.5 : 2.5,
          opacity: isSelected ? 0.95 : 0.65,
          dashArray: isSelected ? undefined : '6 6',
          lineCap: 'round',
        }).addTo(routeGroup);
      });
    }

    // Hospital markers
    const renderedHospitals = new Set<string>();
    listToRender.forEach((amb) => {
      if (renderedHospitals.has(amb.destinationHospital)) return;
      renderedHospitals.add(amb.destinationHospital);

      const matchedAlert = alerts.find((a) => a.ambulanceId === amb.ambulanceId);
      const hospitalIcon = L.divIcon({
        className: 'sertos-hospital-marker',
        html: `
          <div style="display:flex;align-items:center;gap:6px;transform:translate(-18px,-36px);">
            <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:#0D1D32;border:2px solid #EF4444;box-shadow:0 6px 18px rgba(239,68,68,0.45);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v12M6 12h12" stroke="#EF4444" stroke-width="3"/>
              </svg>
            </div>
            <div style="background:rgba(10,23,41,0.92);border:1px solid #1D3552;border-radius:8px;padding:4px 8px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.45);">
              <div style="font-size:11px;font-weight:700;color:#F1F5F9;line-height:1.2;">${amb.destinationHospital}</div>
              <div style="font-size:10px;color:#94A3B8;line-height:1.2;">Emergency Receiving</div>
            </div>
          </div>
        `,
        iconSize: [140, 42],
        iconAnchor: [18, 36],
      });

      const marker = L.marker(amb.hospitalCoords, { icon: hospitalIcon });
      marker.bindPopup(
        `<div class="text-xs space-y-1.5 min-w-[190px]">
          <div class="font-bold text-white text-sm">${amb.destinationHospital}</div>
          <div class="flex justify-between gap-3"><span class="text-[#94A3B8]">Available ER Beds:</span><span class="font-semibold text-[#20E39A]">${matchedAlert?.hospitalBedsAvailable ?? 4} Beds</span></div>
          <div class="flex justify-between gap-3"><span class="text-[#94A3B8]">Destination Status:</span><span class="font-semibold text-[#24A8FF]">ER Ready</span></div>
          <div class="flex justify-between gap-3"><span class="text-[#94A3B8]">Est. Arrival:</span><span class="font-mono font-semibold text-white">${amb.etaMinutes === 0 ? 'Arrived' : `${amb.etaMinutes} min`}</span></div>
        </div>`
      );
      marker.addTo(hospitalGroup);
    });
  }, [ambulances, activeAmb, alerts, showRoutes, showAllAmbulances]);

  // Render Ambulance Markers
  useEffect(() => {
    const group = ambulanceLayerRef.current;
    if (!group) return;
    group.clearLayers();

    const list = showAllAmbulances ? ambulances : [activeAmb];

    list.forEach((amb) => {
      const isSelected = amb.ambulanceId === activeAmb.ambulanceId;
      const ambIcon = L.divIcon({
        className: 'sertos-ambulance-marker',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
            <div style="width:${isSelected ? 40 : 32}px;height:${isSelected ? 40 : 32}px;border-radius:9999px;background:${isSelected ? 'rgba(36,168,255,0.22)' : 'rgba(13,29,50,0.9)'};border:2px solid ${isSelected ? '#38BDF8' : '#24A8FF'};display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(36,168,255,0.6);">
              <svg width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><path d="M8 8v4"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
            <div style="margin-top:3px;padding:1px 6px;border-radius:5px;background:rgba(2,11,24,0.9);border:1px solid ${isSelected ? '#24A8FF' : '#1D3552'};color:#F1F5F9;font-size:10px;font-weight:700;white-space:nowrap;">
              ${amb.ambulanceId}
            </div>
          </div>
        `,
        iconSize: [70, 56],
        iconAnchor: [35, 22],
      });

      const marker = L.marker(amb.currentCoords, { icon: ambIcon, zIndexOffset: isSelected ? 500 : 100 });
      marker.on('click', () => {
        setSelectedAmbulanceId(amb.ambulanceId);
      });
      marker.bindPopup(
        `<div class="text-xs space-y-1.5 min-w-[205px]">
          <div class="flex items-center justify-between border-b border-[#1D3552] pb-1">
            <span class="font-bold text-white text-sm">Ambulance #${amb.ambulanceId}</span>
            <span class="text-[10px] font-semibold text-[#F59E0B]">${appMode}</span>
          </div>
          <div class="flex justify-between gap-2"><span class="text-[#94A3B8]">Emergency ID:</span><span class="font-mono text-white">${amb.incidentId}</span></div>
          <div class="flex justify-between gap-2"><span class="text-[#94A3B8]">Speed:</span><span class="font-mono text-[#20E39A] font-semibold">${amb.speedKmh} km/h</span></div>
          <div class="flex justify-between gap-2"><span class="text-[#94A3B8]">ETA:</span><span class="font-mono text-white font-semibold">${amb.etaMinutes === 0 ? 'Arrived' : `${amb.etaMinutes} min (${amb.distanceRemainingKm} km)`}</span></div>
          <div class="flex justify-between gap-2"><span class="text-[#94A3B8]">Status:</span><span class="text-[#24A8FF] font-semibold">${amb.status}</span></div>
          <div class="flex justify-between gap-2"><span class="text-[#94A3B8]">Hospital:</span><span class="text-white font-medium">${amb.destinationHospital}</span></div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [ambulances, activeAmb, showAllAmbulances, appMode, setSelectedAmbulanceId]);

  // Render Police Units
  useEffect(() => {
    const group = policeLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showPolice) return;

    policeUnits.forEach((unit) => {
      const icon = L.divIcon({
        className: 'sertos-police-marker',
        html: `
          <div style="width:26px;height:26px;border-radius:8px;background:#0A1729;border:1.5px solid #00D084;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,208,132,0.35);transform:translate(-50%,-50%);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20E39A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker(unit.coords, { icon });
      marker.bindPopup(
        `<div class="text-xs space-y-1">
          <div class="font-bold text-white">${unit.unitCode}</div>
          <div class="text-[#94A3B8]">Officer: <span class="text-white">${unit.officerName}</span></div>
          <div class="text-[#94A3B8]">Zone: <span class="text-white">${unit.zone}</span></div>
          <div class="text-[#94A3B8]">Status: <span class="text-[#20E39A] font-semibold">${unit.status}</span></div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [policeUnits, showPolice]);

  // Render Incident Markers
  useEffect(() => {
    const group = incidentLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!showIncidents) return;

    const openAlerts = alerts.filter((a) => a.status !== 'Resolved');
    openAlerts.forEach((al, idx) => {
      const linkedAmb = ambulances.find((a) => a.ambulanceId === al.ambulanceId);
      const pos: [number, number] = linkedAmb
        ? linkedAmb.routeWaypoints[0]
        : [12.971 + idx * 0.004, 77.602 + idx * 0.006];

      const color =
        al.priority === 'Critical'
          ? '#EF4444'
          : al.priority === 'High'
          ? '#F59E0B'
          : '#24A8FF';

      const icon = L.divIcon({
        className: 'sertos-incident-marker',
        html: `
          <div style="width:22px;height:22px;border-radius:9999px;background:${color};border:2px solid #020B18;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;box-shadow:0 0 12px ${color};transform:translate(-50%,-50%);">
            !
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker(pos, { icon });
      marker.bindPopup(
        `<div class="text-xs space-y-1">
          <div class="font-bold text-white">${al.incidentId}</div>
          <div class="text-[#CBD5E1]">${al.type} (${al.priority})</div>
          <div class="text-[#94A3B8]">Location: ${al.location}</div>
          <div class="text-[#94A3B8]">Status: <span class="text-white font-semibold">${al.status}</span></div>
        </div>`
      );
      marker.addTo(group);
    });
  }, [alerts, ambulances, showIncidents]);

  // Center when focusAmbulanceId explicitly changes on AmbulanceTracking page
  useEffect(() => {
    if (!focusAmbulanceId || !mapRef.current) return;
    const target = ambulances.find((a) => a.ambulanceId === focusAmbulanceId);
    if (target) {
      mapRef.current.panTo(target.currentCoords, { animate: true });
    }
  }, [focusAmbulanceId, ambulances]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => mapRef.current?.setView(BENGALURU_CENTER, 14, { animate: true });
  const handleLocateAmbulance = () =>
    mapRef.current?.setView(activeAmb.currentCoords, 15, { animate: true });

  return (
    <div
      className={`relative w-full ${heightClass} rounded-xl bg-[#0A1729] border border-[#1D3552] overflow-hidden shadow-lg`}
    >
      {/* Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" aria-label="Bengaluru Live Traffic Map" />

      {/* Top-left Floating Layer Toggles + Mode Badge */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-1.5">
        <span className="px-2.5 py-1 rounded-lg bg-[#0A1729]/90 border border-[#1D3552] text-[11px] font-semibold text-[#F59E0B] backdrop-blur-md">
          {appMode === 'DEMO' ? 'DEMO ROUTE SIMULATION' : 'LIVE GPS'}
        </span>

        <button
          type="button"
          onClick={() => setShowTraffic((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md transition-colors ${
            showTraffic
              ? 'bg-[#00D084]/20 border-[#00D084]/50 text-[#20E39A]'
              : 'bg-[#0A1729]/85 border-[#1D3552] text-[#94A3B8] hover:text-white'
          }`}
          title="Toggle traffic flow layer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Traffic</span>
        </button>

        <button
          type="button"
          onClick={() => setShowRoutes((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md transition-colors ${
            showRoutes
              ? 'bg-[#24A8FF]/20 border-[#24A8FF]/50 text-[#38BDF8]'
              : 'bg-[#0A1729]/85 border-[#1D3552] text-[#94A3B8] hover:text-white'
          }`}
          title="Toggle emergency routes"
        >
          <Route className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPolice((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md transition-colors ${
            showPolice
              ? 'bg-[#00D084]/20 border-[#00D084]/50 text-[#20E39A]'
              : 'bg-[#0A1729]/85 border-[#1D3552] text-[#94A3B8] hover:text-white'
          }`}
          title="Toggle police units"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Police</span>
        </button>

        <button
          type="button"
          onClick={() => setShowIncidents((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border backdrop-blur-md transition-colors ${
            showIncidents
              ? 'bg-[#EF4444]/20 border-[#EF4444]/50 text-[#FCA5A5]'
              : 'bg-[#0A1729]/85 border-[#1D3552] text-[#94A3B8] hover:text-white'
          }`}
          title="Toggle incident markers"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Incidents</span>
        </button>
      </div>

      {/* Top-right Floating Ambulance Telemetry Pill (matching reference visual) */}
      <button
        type="button"
        onClick={handleLocateAmbulance}
        className="hidden sm:flex absolute top-3 right-3 z-[400] items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#0A1729]/92 hover:bg-[#0D1D32] border border-[#1D3552] shadow-lg backdrop-blur-md text-left transition-colors"
        title="Click to center map on active ambulance"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#20E39A] shadow-[0_0_8px_#20E39A]" />
        <div>
          <div className="text-xs font-bold text-[#F1F5F9]">
            Ambulance #{activeAmb.ambulanceId}
          </div>
          <div className="text-[11px] text-[#94A3B8] font-mono-tabular">
            ETA: {activeAmb.etaMinutes === 0 ? 'Arrived' : `${activeAmb.etaMinutes} min`} ·{' '}
            {activeAmb.distanceRemainingKm} km · {activeAmb.speedKmh} km/h
          </div>
        </div>
      </button>

      {/* Bottom-left Traffic Flow Legend (matching reference image) */}
      <div className="absolute bottom-3 left-3 z-[400] rounded-xl bg-[#0A1729]/92 border border-[#1D3552] px-3.5 py-2.5 backdrop-blur-md shadow-lg">
        <p className="text-xs font-semibold text-[#F1F5F9] mb-1.5">Traffic Flow</p>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <span className="w-3.5 h-1.5 rounded-full bg-[#20E39A]" />
            <span>Smooth</span>
          </div>
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <span className="w-3.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-[#CBD5E1]">
            <span className="w-3.5 h-1.5 rounded-full bg-[#EF4444]" />
            <span>Heavy</span>
          </div>
        </div>
      </div>

      {/* Bottom-right Map Controls (+ / - / Reset / Locate Ambulance) */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col rounded-xl bg-[#0A1729]/92 border border-[#1D3552] overflow-hidden backdrop-blur-md shadow-lg">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2.5 text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] border-b border-[#1D3552] transition-colors"
          aria-label="Zoom in map"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2.5 text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] border-b border-[#1D3552] transition-colors"
          aria-label="Zoom out map"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleLocateAmbulance}
          className="p-2.5 text-[#24A8FF] hover:text-white hover:bg-[#0D1D32] border-b border-[#1D3552] transition-colors"
          aria-label="Locate ambulance"
          title="Locate active ambulance"
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="p-2.5 text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] transition-colors"
          aria-label="Reset map view"
          title="Reset Bengaluru view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
