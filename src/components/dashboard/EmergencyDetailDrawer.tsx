import React from 'react';
import {
  Activity,
  Ambulance,
  CheckCircle2,
  Hospital,
  MapPin,
  Radio,
  Shield,
  X,
} from 'lucide-react';
import { EmergencyAlert } from '../../types/sertos';
import { useSertos } from '../../context/SertosContext';

interface EmergencyDetailDrawerProps {
  alert: EmergencyAlert | null;
  onClose: () => void;
}

export const EmergencyDetailDrawer: React.FC<EmergencyDetailDrawerProps> = ({
  alert,
  onClose,
}) => {
  const {
    appMode,
    ambulances,
    acknowledgeAlert,
    assignPoliceUnit,
    notifyNearbyUnits,
    resolveAlert,
  } = useSertos();

  if (!alert) return null;

  const linkedAmb = ambulances.find((a) => a.ambulanceId === alert.ambulanceId);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#020B18]/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`Emergency details for ${alert.incidentId}`}
    >
      <div className="w-full max-w-lg h-full bg-[#0A1729] border-l border-[#1D3552] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#061326] border-b border-[#1D3552]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono-tabular text-[#24A8FF]">
                {alert.incidentId}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                {appMode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  alert.priority === 'Critical'
                    ? 'bg-[#EF4444] text-white'
                    : alert.priority === 'High'
                    ? 'bg-[#F59E0B]/20 text-[#FCD34D]'
                    : 'bg-[#24A8FF]/20 text-[#38BDF8]'
                }`}
              >
                {alert.priority}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#F1F5F9] mt-1">{alert.type}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1D32] transition-colors"
            aria-label="Close emergency drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Patient & Condition */}
          <div className="rounded-xl bg-[#0D1D32] border border-[#1D3552] p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
              <Activity className="w-4 h-4 text-[#EF4444]" />
              <span>Patient &amp; Clinical Status</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#94A3B8]">Patient</p>
                <p className="font-semibold text-[#F1F5F9]">{alert.patientSummary}</p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Alert Status</p>
                <p className="font-semibold text-[#20E39A]">{alert.status}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">Clinical Condition</p>
              <p className="text-sm text-[#E2E8F0] mt-0.5">{alert.condition}</p>
            </div>
          </div>

          {/* Ambulance & Route Info */}
          <div className="rounded-xl bg-[#0D1D32] border border-[#1D3552] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
              <Ambulance className="w-4 h-4 text-[#24A8FF]" />
              <span>Ambulance &amp; Corridor Information</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#94A3B8]">Ambulance ID</p>
                <p className="font-semibold font-mono-tabular text-[#F1F5F9]">
                  {alert.ambulanceId}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Ambulance Status</p>
                <p className="font-semibold text-[#24A8FF]">
                  {linkedAmb?.status || 'En Route'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Destination Hospital</p>
                <p className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                  <Hospital className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>{alert.hospital}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">ETA / Distance</p>
                <p className="font-semibold font-mono-tabular text-[#20E39A]">
                  {linkedAmb
                    ? linkedAmb.etaMinutes === 0
                      ? 'Arrived'
                      : `${linkedAmb.etaMinutes} min · ${linkedAmb.distanceRemainingKm} km`
                    : `${alert.etaMinutes} min · ${alert.distanceKm} km`}
                </p>
              </div>
            </div>
            <div className="pt-1 border-t border-[#1D3552] text-xs text-[#94A3B8] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Origin / Corridor: {alert.location} ({alert.zone})</span>
            </div>
          </div>

          {/* Police Response Status */}
          <div className="rounded-xl bg-[#0D1D32] border border-[#1D3552] p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8]">
              <Shield className="w-4 h-4 text-[#20E39A]" />
              <span>Police Response Coordination</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#94A3B8]">Assigned Escort Unit</p>
                <p className="font-semibold font-mono-tabular text-[#F1F5F9]">
                  {alert.assignedPoliceUnit || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Nearby Units Alerted</p>
                <p className="font-semibold text-[#F1F5F9]">
                  {alert.nearbyUnitsNotified ? 'Yes — Broadcast Active' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline of Events */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              Incident Timeline
            </h3>
            <div className="space-y-3 border-l border-[#1D3552] ml-2 pl-4">
              {alert.timeline.map((ev) => (
                <div key={ev.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#20E39A] border-2 border-[#0A1729]" />
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#F1F5F9]">{ev.title}</span>
                    <span className="font-mono-tabular text-[#94A3B8]">{ev.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{ev.detail}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">By {ev.actor}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {alert.status !== 'Resolved' && (
          <div className="px-5 py-3.5 bg-[#061326] border-t border-[#1D3552] flex flex-wrap items-center gap-2">
            {alert.status === 'New' && (
              <button
                type="button"
                onClick={() => acknowledgeAlert(alert.id)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#24A8FF] hover:bg-[#38BDF8] text-[#020B18] transition-colors"
              >
                Acknowledge
              </button>
            )}
            {!alert.assignedPoliceUnit && (
              <button
                type="button"
                onClick={() => assignPoliceUnit(alert.id, 'BTP-UNIT-15')}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#0D1D32] hover:bg-[#162B47] text-[#F1F5F9] border border-[#1D3552] transition-colors"
              >
                Assign BTP-UNIT-15
              </button>
            )}
            {!alert.nearbyUnitsNotified && (
              <button
                type="button"
                onClick={() => notifyNearbyUnits(alert.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0D1D32] hover:bg-[#162B47] text-[#F1F5F9] border border-[#1D3552] transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Notify Nearby</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => resolveAlert(alert.id)}
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
