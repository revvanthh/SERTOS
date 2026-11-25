import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Eye,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react';
import { useSertos } from '../context/SertosContext';
import { EmergencyAlert } from '../types/sertos';
import { downloadCsvFile } from '../utils/csvExport';
import { EmergencyDetailDrawer } from '../components/dashboard/EmergencyDetailDrawer';

export const EmergencyAlerts: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    assignPoliceUnit,
    notifyNearbyUnits,
    resolveAlert,
    setSelectedAmbulanceId,
    refreshOperationalData,
    addToast,
  } = useSertos();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortDir, setSortDir] = useState<'newest' | 'oldest'>('newest');
  const [drawerAlertId, setDrawerAlertId] = useState<string | null>(null);

  const zones = useMemo(
    () => ['All', ...Array.from(new Set(alerts.map((a) => a.zone)))],
    [alerts]
  );

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = alerts.filter((a) => {
      if (severityFilter !== 'All' && a.priority !== severityFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (locationFilter !== 'All' && a.zone !== locationFilter) return false;
      if (
        q &&
        !a.incidentId.toLowerCase().includes(q) &&
        !a.type.toLowerCase().includes(q) &&
        !a.location.toLowerCase().includes(q) &&
        !a.hospital.toLowerCase().includes(q) &&
        !a.ambulanceId.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      const tA = new Date(a.timestampIso).getTime();
      const tB = new Date(b.timestampIso).getTime();
      return sortDir === 'newest' ? tB - tA : tA - tB;
    });
  }, [alerts, search, severityFilter, statusFilter, locationFilter, sortDir]);

  const activeDrawerAlert: EmergencyAlert | null = drawerAlertId
    ? alerts.find((a) => a.id === drawerAlertId) || null
    : null;

  const handleViewRoute = (alert: EmergencyAlert) => {
    setSelectedAmbulanceId(alert.ambulanceId);
    navigate('/ambulance-tracking');
  };

  const handleExportCsv = () => {
    const count = downloadCsvFile(
      `sertos-emergency-alerts-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredAlerts.map((a) => ({
        incidentId: a.incidentId,
        type: a.type,
        patientSummary: a.patientSummary,
        location: a.location,
        zone: a.zone,
        ambulanceId: a.ambulanceId,
        hospital: a.hospital,
        priority: a.priority,
        etaMinutes: a.etaMinutes,
        distanceKm: a.distanceKm,
        timeReceived: a.timeReceived,
        status: a.status,
        assignedPoliceUnit: a.assignedPoliceUnit || 'Unassigned',
        nearbyUnitsNotified: a.nearbyUnitsNotified ? 'Yes' : 'No',
      })),
      [
        { key: 'incidentId', header: 'Incident ID' },
        { key: 'type', header: 'Emergency Type' },
        { key: 'patientSummary', header: 'Patient' },
        { key: 'location', header: 'Location' },
        { key: 'zone', header: 'Division Zone' },
        { key: 'ambulanceId', header: 'Ambulance ID' },
        { key: 'hospital', header: 'Destination Hospital' },
        { key: 'priority', header: 'Priority' },
        { key: 'etaMinutes', header: 'ETA (min)' },
        { key: 'distanceKm', header: 'Distance (km)' },
        { key: 'timeReceived', header: 'Time Received (IST)' },
        { key: 'status', header: 'Status' },
        { key: 'assignedPoliceUnit', header: 'Assigned Police Unit' },
        { key: 'nearbyUnitsNotified', header: 'Nearby Units Notified' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Emergency Alerts CSV Exported',
      description: `Downloaded ${count} emergency alert records.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Emergency Alerts Command</h1>
          <p className="text-xs text-[#94A3B8]">
            Manage incoming ambulance corridors, assign escort units, and update incident statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshOperationalData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-xs font-medium text-[#CBD5E1]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Incident, Ambulance..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:border-[#24A8FF]"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          aria-label="Filter by severity"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          <option value="All">Severity: All</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by alert status"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          <option value="All">Status: All</option>
          <option value="New">New</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          aria-label="Filter by division"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              Division: {z}
            </option>
          ))}
        </select>

        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as 'newest' | 'oldest')}
          aria-label="Sort alerts by time"
          className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-xs text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>
      </div>

      {/* Alerts List Table */}
      <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#061326] border-b border-[#1D3552] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Type &amp; Location</th>
                <th className="py-3 px-4">Ambulance / Hospital</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">ETA</th>
                <th className="py-3 px-4">Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D3552]/70 text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#94A3B8]">
                    No emergency alerts match your current filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((al) => (
                  <tr key={al.id} className="hover:bg-[#0D1D32]/70 transition-colors">
                    <td className="py-3 px-4 font-mono-tabular font-bold text-[#24A8FF] whitespace-nowrap">
                      {al.incidentId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#F1F5F9]">{al.type}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {al.location} · {al.zone}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-mono-tabular font-semibold text-[#F1F5F9]">
                        {al.ambulanceId}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">{al.hospital}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          al.priority === 'Critical'
                            ? 'bg-[#EF4444] text-white'
                            : al.priority === 'High'
                            ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B]/40'
                            : al.priority === 'Medium'
                            ? 'bg-[#24A8FF]/20 text-[#38BDF8]'
                            : 'bg-[#1D3552] text-[#CBD5E1]'
                        }`}
                      >
                        {al.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-tabular text-[#F1F5F9] whitespace-nowrap">
                      {al.status === 'Resolved' ? 'Arrived' : `${al.etaMinutes} min`}
                    </td>
                    <td className="py-3 px-4 font-mono-tabular text-[#94A3B8] whitespace-nowrap">
                      {al.timeReceived}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold ${
                          al.status === 'New'
                            ? 'text-[#EF4444]'
                            : al.status === 'In Progress'
                            ? 'text-[#24A8FF]'
                            : al.status === 'Acknowledged'
                            ? 'text-[#F59E0B]'
                            : 'text-[#20E39A]'
                        }`}
                      >
                        {al.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {al.status === 'New' && (
                          <button
                            type="button"
                            onClick={() => acknowledgeAlert(al.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#24A8FF] hover:bg-[#38BDF8] text-[#020B18] text-[11px] font-bold"
                          >
                            Acknowledge
                          </button>
                        )}
                        {al.status !== 'Resolved' && !al.assignedPoliceUnit && (
                          <button
                            type="button"
                            onClick={() => assignPoliceUnit(al.id, 'BTP-UNIT-15')}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] text-[#CBD5E1]"
                            title="Assign police unit"
                          >
                            <Shield className="w-3 h-3 text-[#20E39A]" />
                            <span>Assign</span>
                          </button>
                        )}
                        {al.status !== 'Resolved' && !al.nearbyUnitsNotified && (
                          <button
                            type="button"
                            onClick={() => notifyNearbyUnits(al.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] text-[#CBD5E1]"
                            title="Notify nearby units"
                          >
                            <Radio className="w-3 h-3 text-[#F59E0B]" />
                            <span>Notify</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewRoute(al)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] text-[#38BDF8]"
                          title="Focus route on tracking map"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Route</span>
                        </button>
                        {al.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => resolveAlert(al.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#00D084]/15 hover:bg-[#00D084]/25 border border-[#00D084]/40 text-[11px] font-semibold text-[#20E39A]"
                            title="Mark resolved"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDrawerAlertId(al.id)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-[11px] text-[#F1F5F9]"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmergencyDetailDrawer
        alert={activeDrawerAlert}
        onClose={() => setDrawerAlertId(null)}
      />
    </div>
  );
};
