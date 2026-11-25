import React, { useState } from 'react';
import { AlertCircle, ChevronRight, FileText } from 'lucide-react';
import { useSertos } from '../../context/SertosContext';
import { EmergencyDetailDrawer } from './EmergencyDetailDrawer';

export const EmergencyDetailsPanel: React.FC = () => {
  const { appMode, primaryAlert, primaryAmbulance } = useSertos();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1D3552]/80">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#CBD5E1]" />
            <h2 className="text-[15px] font-semibold text-[#F1F5F9]">Emergency Details</h2>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
              appMode === 'LIVE'
                ? 'bg-[#EF4444] text-white'
                : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
            }`}
          >
            {appMode}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/35 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-[#EF4444]" />
          </div>

          <dl className="flex-1 min-w-0 space-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Incident ID</dt>
              <dd className="text-[#F1F5F9] font-semibold font-mono-tabular truncate">
                : {primaryAlert.incidentId}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Type</dt>
              <dd className="text-[#F1F5F9] font-medium truncate">: {primaryAlert.type}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Patient</dt>
              <dd className="text-[#F1F5F9] truncate">: {primaryAlert.patientSummary}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Hospital</dt>
              <dd className="text-[#F1F5F9] font-medium truncate">: {primaryAlert.hospital}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Priority</dt>
              <dd className="flex items-center gap-1.5">
                <span className="text-[#94A3B8]">:</span>
                <span className="px-2 py-0.5 rounded bg-[#EF4444] text-white text-[11px] font-bold leading-none">
                  {primaryAlert.priority}
                </span>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="w-20 shrink-0 text-[#94A3B8]">Ambulance</dt>
              <dd className="text-[#24A8FF] font-semibold font-mono-tabular truncate">
                : {primaryAmbulance.ambulanceId} ·{' '}
                {primaryAmbulance.etaMinutes === 0
                  ? 'Arrived'
                  : `${primaryAmbulance.etaMinutes} min (${primaryAmbulance.distanceRemainingKm} km)`}
              </dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="mt-3.5 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0D1D32] hover:bg-[#152B49] border border-[#1D3552] text-xs font-semibold text-[#F1F5F9] transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
        </button>
      </section>

      <EmergencyDetailDrawer
        alert={drawerOpen ? primaryAlert : null}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};
