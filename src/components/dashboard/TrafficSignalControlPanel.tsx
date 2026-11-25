import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSertos } from '../../context/SertosContext';
import { formatCountdown } from '../../utils/time';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { SignalDetailModal } from './SignalDetailModal';

export const TrafficSignalControlPanel: React.FC = () => {
  const { signals, toggleSignalPriority } = useSertos();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const mgSignal = signals.find((s) => s.signalId === 'SIG-MG-01') || signals[0];
  const isEmergency = mgSignal.mode === 'Emergency Priority';

  return (
    <>
      <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1D3552]/80">
          <h2 className="text-[15px] font-semibold text-[#F1F5F9]">Traffic Signal Control</h2>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              isEmergency
                ? 'bg-[#00D084] text-[#020B18]'
                : 'bg-[#24A8FF]/20 text-[#38BDF8] border border-[#24A8FF]/40'
            }`}
          >
            {mgSignal.status} · SIM
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Traffic Light Housing */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex flex-col items-center gap-1.5 px-2 py-2 rounded-lg bg-[#061326] border border-[#1D3552] shrink-0"
              aria-label={`Traffic light currently ${mgSignal.currentLight}`}
            >
              <span
                className={`w-3 h-3 rounded-full transition-all ${
                  mgSignal.currentLight === 'Red'
                    ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'
                    : 'bg-[#EF4444]/20'
                }`}
              />
              <span
                className={`w-3 h-3 rounded-full transition-all ${
                  mgSignal.currentLight === 'Yellow'
                    ? 'bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]'
                    : 'bg-[#F59E0B]/20'
                }`}
              />
              <span
                className={`w-3 h-3 rounded-full transition-all ${
                  mgSignal.currentLight === 'Green'
                    ? 'bg-[#20E39A] shadow-[0_0_10px_#20E39A]'
                    : 'bg-[#20E39A]/20'
                }`}
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#F1F5F9] truncate">
                Signal at {mgSignal.location}
              </p>
              <p
                className={`text-xs mt-0.5 truncate ${
                  isEmergency ? 'text-[#20E39A] font-medium' : 'text-[#94A3B8]'
                }`}
              >
                {isEmergency
                  ? 'Priority Green — Emergency Route'
                  : `Current State: ${mgSignal.currentLight} (${mgSignal.mode})`}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-mono-tabular">
                {mgSignal.signalId} · Demo Simulation
              </p>
            </div>
          </div>

          {/* Countdown Box */}
          <div className="px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] shrink-0 text-center">
            <span className="font-mono-tabular text-lg font-bold text-[#F1F5F9]">
              {formatCountdown(mgSignal.countdownSeconds)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
              isEmergency
                ? 'bg-[#0D1D32] hover:bg-[#162B47] text-[#F59E0B] border border-[#F59E0B]/40'
                : 'bg-[#00D084] hover:bg-[#20E39A] text-[#020B18]'
            }`}
          >
            {isEmergency ? 'Disable Priority Sim' : 'Priority Green Sim'}
          </button>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-xs font-semibold text-[#CBD5E1] hover:text-white transition-colors"
            title="Inspect signal details and phase controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Controls</span>
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={
          isEmergency
            ? 'Disable Emergency Priority Simulation?'
            : 'Activate Priority Green Simulation?'
        }
        description={
          isEmergency
            ? `This will return ${mgSignal.location} (${mgSignal.signalId}) back to standard simulated cycle timing.`
            : `This will set ${mgSignal.location} (${mgSignal.signalId}) to Priority Green — Emergency Route in simulation mode.`
        }
        warningText="Simulation Warning: No physical traffic signal hardware is connected. This control simulates emergency signal preemption for demonstration."
        confirmLabel={isEmergency ? 'Disable Simulation' : 'Activate Priority Green'}
        variant={isEmergency ? 'warning' : 'primary'}
        onConfirm={() => {
          toggleSignalPriority(mgSignal.signalId, !isEmergency);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      <SignalDetailModal
        signal={detailsOpen ? mgSignal : null}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};
