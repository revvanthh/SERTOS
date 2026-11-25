import React, { useMemo, useState } from 'react';
import {
  Ambulance,
  Check,
  Download,
  Eye,
  FastForward,
  Navigation,
  Search,
} from 'lucide-react';
import { useSertos } from '../context/SertosContext';
import { BengaluruTrafficMap } from '../components/map/BengaluruTrafficMap';
import { EmergencyDetailDrawer } from '../components/dashboard/EmergencyDetailDrawer';
import { downloadCsvFile } from '../utils/csvExport';

export const AmbulanceTracking: React.FC = () => {
  const {
    appMode,
    ambulances,
    alerts,
    selectedAmbulanceId,
    setSelectedAmbulanceId,
    advanceAmbulanceSimulation,
    addToast,
  } = useSertos();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredAmbulances = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ambulances.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (
        q &&
        !a.ambulanceId.toLowerCase().includes(q) &&
        !a.incidentId.toLowerCase().includes(q) &&
        !a.destinationHospital.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [ambulances, search, statusFilter]);

  const selectedAmb =
    ambulances.find((a) => a.ambulanceId === selectedAmbulanceId) || ambulances[0];
  const linkedAlert =
    alerts.find((al) => al.ambulanceId === selectedAmb.ambulanceId) || alerts[0];

  const handleExportCsv = () => {
    const count = downloadCsvFile(
      `sertos-ambulance-fleet-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredAmbulances.map((a) => ({
        ambulanceId: a.ambulanceId,
        incidentId: a.incidentId,
        paramedicUnit: a.paramedicUnit,
        driverName: a.driverName,
        status: a.status,
        speedKmh: a.speedKmh,
        etaMinutes: a.etaMinutes,
        distanceRemainingKm: a.distanceRemainingKm,
        destinationHospital: a.destinationHospital,
        latitude: a.currentCoords[0].toFixed(5),
        longitude: a.currentCoords[1].toFixed(5),
        lastUpdated: a.lastUpdated,
      })),
      [
        { key: 'ambulanceId', header: 'Ambulance ID' },
        { key: 'incidentId', header: 'Incident ID' },
        { key: 'paramedicUnit', header: 'Paramedic Unit' },
        { key: 'driverName', header: 'Driver' },
        { key: 'status', header: 'Status' },
        { key: 'speedKmh', header: 'Speed (km/h)' },
        { key: 'etaMinutes', header: 'ETA (min)' },
        { key: 'distanceRemainingKm', header: 'Distance Remaining (km)' },
        { key: 'destinationHospital', header: 'Destination Hospital' },
        { key: 'latitude', header: 'Latitude' },
        { key: 'longitude', header: 'Longitude' },
        { key: 'lastUpdated', header: 'Last Updated (IST)' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Ambulance Fleet CSV Exported',
      description: `Downloaded ${count} ambulance telemetry records.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Ambulance Corridor Tracking</h1>
          <p className="text-xs text-[#94A3B8]">
            Select an active ambulance to synchronize map telemetry, route corridor, and arrival stages ({appMode} Mode).
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Fleet CSV</span>
        </button>
      </div>

      {/* Main Split: Fleet List + Map & Selected Details */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left List */}
        <div className="xl:col-span-4 rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Ambulance, Incident, Hospital..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#24A8FF]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter ambulance status"
              className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
            >
              <option value="All">Status: All</option>
              <option value="Dispatched">Dispatched</option>
              <option value="En Route">En Route</option>
              <option value="Approaching Hospital">Approaching Hospital</option>
              <option value="Arrived">Arrived</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {filteredAmbulances.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No ambulances match your search.
              </div>
            ) : (
              filteredAmbulances.map((amb) => {
                const isSelected = amb.ambulanceId === selectedAmb.ambulanceId;
                return (
                  <button
                    key={amb.id}
                    type="button"
                    onClick={() => setSelectedAmbulanceId(amb.ambulanceId)}
                    className={`w-full text-left rounded-xl p-3.5 border transition-all ${
                      isSelected
                        ? 'bg-[#0D1D32] border-[#24A8FF] shadow-[0_0_16px_rgba(36,168,255,0.16)]'
                        : 'bg-[#061326] hover:bg-[#0D1D32]/70 border-[#1D3552]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-bold text-sm text-[#F1F5F9] font-mono-tabular">
                        <Ambulance className="w-4 h-4 text-[#24A8FF]" />
                        <span>{amb.ambulanceId}</span>
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          amb.status === 'Arrived' || amb.status === 'Completed'
                            ? 'text-[#20E39A]'
                            : amb.status === 'Approaching Hospital'
                            ? 'text-[#F59E0B]'
                            : 'text-[#24A8FF]'
                        }`}
                      >
                        {amb.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#CBD5E1] mt-1 truncate">
                      → {amb.destinationHospital}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-[#94A3B8] font-mono-tabular">
                      <span>{amb.incidentId}</span>
                      <span>
                        {amb.speedKmh} km/h ·{' '}
                        {amb.etaMinutes === 0 ? 'Arrived' : `ETA ${amb.etaMinutes}m`}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Synchronized Map + Selected Ambulance Timeline */}
        <div className="xl:col-span-8 space-y-4">
          <BengaluruTrafficMap
            heightClass="h-[380px] sm:h-[430px]"
            focusAmbulanceId={selectedAmb.ambulanceId}
            showAllAmbulances
          />

          {/* Selected Ambulance Synchronization Panel */}
          <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1D3552]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#F1F5F9] font-mono-tabular">
                    {selectedAmb.ambulanceId}
                  </h2>
                  <span className="text-xs text-[#94A3B8]">·</span>
                  <span className="text-xs font-medium text-[#24A8FF]">{selectedAmb.status}</span>
                  <span className="text-xs text-[#94A3B8]">·</span>
                  <span className="text-xs font-mono-tabular text-[#94A3B8]">
                    {selectedAmb.paramedicUnit}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Destination: <strong className="text-[#F1F5F9]">{selectedAmb.destinationHospital}</strong> · Driver: {selectedAmb.driverName}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {appMode === 'DEMO' && selectedAmb.status !== 'Arrived' && selectedAmb.status !== 'Completed' && (
                  <button
                    type="button"
                    onClick={() => advanceAmbulanceSimulation(selectedAmb.ambulanceId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-xs font-semibold text-[#20E39A]"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Advance Sim Step</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#24A8FF] hover:bg-[#38BDF8] text-[#020B18] text-xs font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Emergency Details</span>
                </button>
              </div>
            </div>

            {/* Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Incident ID</p>
                <p className="font-mono-tabular font-bold text-[#F1F5F9] mt-0.5">
                  {selectedAmb.incidentId}
                </p>
              </div>
              <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Current Speed</p>
                <p className="font-mono-tabular font-bold text-[#20E39A] mt-0.5">
                  {selectedAmb.speedKmh} km/h
                </p>
              </div>
              <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Remaining Distance</p>
                <p className="font-mono-tabular font-bold text-[#F1F5F9] mt-0.5 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#24A8FF]" />
                  <span>{selectedAmb.distanceRemainingKm} km</span>
                </p>
              </div>
              <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Estimated Arrival</p>
                <p className="font-mono-tabular font-bold text-[#F1F5F9] mt-0.5">
                  {selectedAmb.etaMinutes === 0 ? 'Arrived' : `${selectedAmb.etaMinutes} min`}
                </p>
              </div>
            </div>

            {/* 4-Stage Timeline */}
            <div className="pt-1">
              <p className="text-xs font-semibold text-[#94A3B8] mb-3">Route Progress Timeline</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedAmb.stages.map((st) => (
                  <div
                    key={st.label}
                    className={`rounded-lg p-3 border ${
                      st.completed
                        ? 'bg-[#00D084]/10 border-[#00D084]/40'
                        : st.active
                        ? 'bg-[#24A8FF]/10 border-[#24A8FF]/40'
                        : 'bg-[#061326] border-[#1D3552]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#F1F5F9]">{st.label}</span>
                      {st.completed && <Check className="w-3.5 h-3.5 text-[#20E39A]" />}
                    </div>
                    <p className="text-[11px] font-mono-tabular text-[#94A3B8] mt-1">
                      {st.time || 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmergencyDetailDrawer
        alert={drawerOpen ? linkedAlert : null}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};
