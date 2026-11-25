import React from 'react';
import { Ambulance, Check } from 'lucide-react';
import { useSertos } from '../../context/SertosContext';

export const RouteStatusPanel: React.FC = () => {
  const { primaryAmbulance } = useSertos();

  return (
    <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <h2 className="text-[15px] font-semibold text-[#F1F5F9]">Route Status</h2>
        <span className="text-[11px] font-mono-tabular text-[#24A8FF] font-semibold">
          {primaryAmbulance.ambulanceId}
        </span>
      </div>

      <div className="relative flex items-start justify-between gap-1 pt-1">
        {/* Progress line behind stage nodes */}
        <div
          className="absolute top-[15px] left-5 right-10 h-[2px] bg-[#1D3552]"
          aria-hidden="true"
        />

        {primaryAmbulance.stages.map((stage) => (
          <div key={stage.label} className="relative z-10 flex flex-col items-center text-center flex-1 min-w-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                stage.completed
                  ? 'bg-[#00D084] border-[#20E39A] text-[#020B18] shadow-[0_0_10px_rgba(32,227,154,0.45)]'
                  : stage.active
                  ? 'bg-[#24A8FF]/20 border-[#24A8FF] text-[#24A8FF] shadow-[0_0_10px_rgba(36,168,255,0.45)]'
                  : 'bg-[#0D1D32] border-[#1D3552] text-[#64748B]'
              }`}
            >
              {stage.completed ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <span
              className={`text-[11px] font-medium mt-1.5 leading-tight ${
                stage.completed || stage.active ? 'text-[#F1F5F9]' : 'text-[#64748B]'
              }`}
            >
              {stage.label}
            </span>
            <span className="text-[10px] font-mono-tabular text-[#94A3B8] mt-0.5">
              {stage.time || '—'}
            </span>
          </div>
        ))}

        {/* Small ambulance icon at end matching reference */}
        <div className="relative z-10 flex flex-col items-center shrink-0 pl-1 pt-0.5">
          <div className="w-8 h-6 rounded-md bg-[#0D1D32] border border-[#1D3552] flex items-center justify-center text-[#24A8FF]">
            <Ambulance className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};
