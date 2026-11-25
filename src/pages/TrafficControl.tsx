import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { useSertos } from '../context/SertosContext';
import { TrafficSignal } from '../types/sertos';
import { formatCountdown } from '../utils/time';
import { downloadCsvFile } from '../utils/csvExport';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SignalDetailModal } from '../components/dashboard/SignalDetailModal';

export const TrafficControl: React.FC = () => {
  const { signals, toggleSignalPriority, refreshOperationalData, addToast } = useSertos();

  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [densityFilter, setDensityFilter] = useState('All');

  const [detailSignal, setDetailSignal] = useState<TrafficSignal | null>(null);
  const [confirmSignal, setConfirmSignal] = useState<TrafficSignal | null>(null);

  const zones = useMemo(() => ['All', ...Array.from(new Set(signals.map((s) => s.zone)))], [signals]);

  const filteredSignals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return signals.filter((s) => {
      if (zoneFilter !== 'All' && s.zone !== zoneFilter) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      if (densityFilter !== 'All' && s.trafficDensity !== densityFilter) return false;
      if (
        q &&
        !s.signalId.toLowerCase().includes(q) &&
        !s.location.toLowerCase().includes(q) &&
        !s.junction.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [signals, search, zoneFilter, statusFilter, densityFilter]);

  const activeDetailSignal = detailSignal
    ? signals.find((s) => s.signalId === detailSignal.signalId) || null
    : null;

  const handleExportCsv = () => {
    const count = downloadCsvFile(
      `sertos-traffic-signals-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredSignals.map((s) => ({
        signalId: s.signalId,
        location: s.location,
        junction: s.junction,
        zone: s.zone,
        currentLight: s.currentLight,
        trafficDensity: s.trafficDensity,
        mode: s.mode,
        status: s.status,
        countdownSeconds: s.countdownSeconds,
        trafficVolumePerHour: s.trafficVolumePerHour,
        lastUpdate: s.lastUpdate,
        hardwareConnected: s.hardwareConnected ? 'Connected' : 'Simulated Only',
      })),
      [
        { key: 'signalId', header: 'Signal ID' },
        { key: 'location', header: 'Location' },
        { key: 'junction', header: 'Junction' },
        { key: 'zone', header: 'Zone' },
        { key: 'currentLight', header: 'Current Light' },
        { key: 'trafficDensity', header: 'Traffic Density' },
        { key: 'mode', header: 'Mode' },
        { key: 'status', header: 'Status' },
        { key: 'countdownSeconds', header: 'Countdown (s)' },
        { key: 'trafficVolumePerHour', header: 'Volume (veh/hr)' },
        { key: 'lastUpdate', header: 'Last Update (IST)' },
        { key: 'hardwareConnected', header: 'Hardware Integration' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Signals CSV Exported',
      description: `Downloaded ${count} traffic signal records.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Hardware Simulation Notice Banner */}
      <div className="rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-[#FDE68A]">
          <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            <strong>Simulated Signal Network:</strong> Physical traffic signal controllers are not integrated. Priority green overrides run safe operational simulations only.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshOperationalData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-xs font-medium text-[#CBD5E1]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Signal ID or Junction..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#24A8FF]"
          />
        </div>

        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          aria-label="Filter by zone"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              Zone: {z}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          <option value="All">Status: All</option>
          <option value="Active">Status: Active</option>
          <option value="Offline">Status: Offline</option>
          <option value="Maintenance">Status: Maintenance</option>
        </select>

        <select
          value={densityFilter}
          onChange={(e) => setDensityFilter(e.target.value)}
          aria-label="Filter by traffic density"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          <option value="All">Density: All</option>
          <option value="Smooth">Density: Smooth</option>
          <option value="Moderate">Density: Moderate</option>
          <option value="Heavy">Density: Heavy</option>
        </select>
      </div>

      {/* Signals Table */}
      <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#061326] border-b border-[#1D3552] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-4">Signal ID</th>
                <th className="py-3 px-4">Location &amp; Zone</th>
                <th className="py-3 px-4">Current Light</th>
                <th className="py-3 px-4">Traffic Density</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Update</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D3552]/70 text-xs">
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#94A3B8]">
                    No traffic signals match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredSignals.map((sig) => {
                  const isPriority = sig.mode === 'Emergency Priority';
                  return (
                    <tr key={sig.id} className="hover:bg-[#0D1D32]/70 transition-colors">
                      <td className="py-3 px-4 font-mono-tabular font-bold text-[#24A8FF] whitespace-nowrap">
                        {sig.signalId}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#F1F5F9]">{sig.location}</p>
                        <p className="text-[11px] text-[#94A3B8]">{sig.zone}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#061326] border border-[#1D3552]">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                sig.currentLight === 'Red' ? 'bg-[#EF4444]' : 'bg-[#EF4444]/20'
                              }`}
                            />
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                sig.currentLight === 'Yellow' ? 'bg-[#F59E0B]' : 'bg-[#F59E0B]/20'
                              }`}
                            />
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                sig.currentLight === 'Green' ? 'bg-[#20E39A]' : 'bg-[#20E39A]/20'
                              }`}
                            />
                          </div>
                          <span className="font-mono-tabular font-semibold text-[#F1F5F9]">
                            {formatCountdown(sig.countdownSeconds)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            sig.trafficDensity === 'Smooth'
                              ? 'text-[#20E39A]'
                              : sig.trafficDensity === 'Moderate'
                              ? 'text-[#F59E0B]'
                              : 'text-[#EF4444]'
                          }`}
                        >
                          {sig.trafficDensity}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isPriority
                              ? 'bg-[#00D084]/20 text-[#20E39A] border border-[#00D084]/40'
                              : 'bg-[#061326] text-[#CBD5E1] border border-[#1D3552]'
                          }`}
                        >
                          {sig.mode}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            sig.status === 'Active'
                              ? 'text-[#20E39A]'
                              : sig.status === 'Maintenance'
                              ? 'text-[#F59E0B]'
                              : 'text-[#EF4444]'
                          }`}
                        >
                          {sig.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-tabular text-[#94A3B8] whitespace-nowrap">
                        {sig.lastUpdate}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={sig.status !== 'Active'}
                            onClick={() => setConfirmSignal(sig)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-35 ${
                              isPriority
                                ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/25'
                                : 'bg-[#00D084]/15 text-[#20E39A] border border-[#00D084]/40 hover:bg-[#00D084]/25'
                            }`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>{isPriority ? 'Disable Sim' : 'Priority Sim'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailSignal(sig)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] font-medium text-[#CBD5E1] hover:text-white"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SignalDetailModal signal={activeDetailSignal} onClose={() => setDetailSignal(null)} />

      <ConfirmDialog
        open={Boolean(confirmSignal)}
        title={
          confirmSignal?.mode === 'Emergency Priority'
            ? `Disable Emergency Simulation (${confirmSignal?.signalId})`
            : `Activate Emergency Simulation (${confirmSignal?.signalId})`
        }
        description={
          confirmSignal?.mode === 'Emergency Priority'
            ? `Restore normal simulated traffic light cycle at ${confirmSignal?.location}?`
            : `Simulate Priority Green — Emergency Route at ${confirmSignal?.location}?`
        }
        warningText="Simulation Only: No physical hardware signal controller is connected."
        confirmLabel={
          confirmSignal?.mode === 'Emergency Priority' ? 'Restore Normal' : 'Confirm Simulation'
        }
        variant={confirmSignal?.mode === 'Emergency Priority' ? 'warning' : 'primary'}
        onConfirm={() => {
          if (confirmSignal) {
            toggleSignalPriority(
              confirmSignal.signalId,
              confirmSignal.mode !== 'Emergency Priority'
            );
          }
          setConfirmSignal(null);
        }}
        onCancel={() => setConfirmSignal(null)}
      />
    </div>
  );
};
