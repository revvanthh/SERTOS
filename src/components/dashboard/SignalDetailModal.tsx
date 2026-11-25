import React, { useState } from 'react';
import { AlertTriangle, MapPin, Radio, ShieldAlert, X } from 'lucide-react';
import { SignalLight, TrafficSignal } from '../../types/sertos';
import { useSertos } from '../../context/SertosContext';
import { formatCountdown } from '../../utils/time';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SignalDetailModalProps {
  signal: TrafficSignal | null;
  onClose: () => void;
}

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({ signal, onClose }) => {
  const { toggleSignalPriority, switchSignalLight } = useSertos();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!signal) return null;

  const isEmergency = signal.mode === 'Emergency Priority';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/80 backdrop-blur-xs p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`Signal details for ${signal.signalId}`}
      >
        <div className="w-full max-w-lg rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-[#061326] border-b border-[#1D3552]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono-tabular text-[#24A8FF]">
                  {signal.signalId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                  SIMULATED CONTROL
                </span>
              </div>
              <h2 className="text-base font-bold text-[#F1F5F9] mt-0.5">{signal.junction}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1D32] transition-colors"
              aria-label="Close signal details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-[#FDE68A]">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <span>
                Hardware Integration Notice: Physical Bengaluru traffic controllers are not connected in Demo Mode. Actions below execute a safe control-room simulation only.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Location / Zone</p>
                <p className="font-semibold text-[#F1F5F9] mt-0.5">{signal.location}</p>
                <p className="text-[#64748B] mt-0.5">{signal.zone}</p>
              </div>
              <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">GPS Coordinates</p>
                <p className="font-mono-tabular font-semibold text-[#F1F5F9] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#24A8FF]" />
                  <span>
                    {signal.coords[0].toFixed(4)}, {signal.coords[1].toFixed(4)}
                  </span>
                </p>
                <p className="text-[#64748B] mt-0.5">
                  Hardware: {signal.hardwareConnected ? 'Connected' : 'Simulated Only'}
                </p>
              </div>
              <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Traffic Volume &amp; Cycle</p>
                <p className="font-mono-tabular font-semibold text-[#F1F5F9] mt-0.5">
                  {signal.trafficVolumePerHour.toLocaleString()} veh/hr
                </p>
                <p className="text-[#64748B] mt-0.5">{signal.cycleTiming}</p>
              </div>
              <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3">
                <p className="text-[#94A3B8]">Current State &amp; Timer</p>
                <p className="font-semibold text-[#20E39A] mt-0.5">
                  {signal.currentLight} · {formatCountdown(signal.countdownSeconds)}
                </p>
                <p className="text-[#64748B] mt-0.5">Maint: {signal.lastMaintenance}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#94A3B8] mb-1.5">Affected Routes</p>
              <div className="flex flex-wrap gap-1.5">
                {signal.affectedRoutes.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 rounded-md bg-[#0D1D32] border border-[#1D3552] text-xs text-[#CBD5E1]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Safe Simulated Phase Controls */}
            <div className="pt-2 border-t border-[#1D3552] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#F1F5F9]">
                  Simulated Phase Selection
                </span>
                <div className="flex items-center gap-1.5">
                  {(['Green', 'Yellow', 'Red'] as SignalLight[]).map((light) => (
                    <button
                      key={light}
                      type="button"
                      disabled={signal.status !== 'Active'}
                      onClick={() => switchSignalLight(signal.signalId, light)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${
                        signal.currentLight === light
                          ? light === 'Green'
                            ? 'bg-[#00D084]/20 border-[#00D084] text-[#20E39A]'
                            : light === 'Yellow'
                            ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FCD34D]'
                            : 'bg-[#EF4444]/20 border-[#EF4444] text-[#FCA5A5]'
                          : 'bg-[#0D1D32] border-[#1D3552] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {light}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={signal.status !== 'Active'}
                onClick={() => setConfirmOpen(true)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${
                  isEmergency
                    ? 'bg-[#0D1D32] hover:bg-[#162B47] text-[#F59E0B] border border-[#F59E0B]/40'
                    : 'bg-[#00D084] hover:bg-[#20E39A] text-[#020B18]'
                }`}
              >
                {isEmergency ? (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Disable Emergency Priority Simulation</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Activate Emergency Priority Simulation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={
          isEmergency
            ? `Disable Priority Simulation (${signal.signalId})`
            : `Activate Emergency Priority Simulation (${signal.signalId})`
        }
        description={
          isEmergency
            ? `Return ${signal.location} (${signal.signalId}) to normal simulated cycle timing?`
            : `Set ${signal.location} (${signal.signalId}) to simulated Priority Green — Emergency Route?`
        }
        warningText="Simulation Only: No physical traffic signal hardware is connected. This updates the SERTOS operational simulation state."
        confirmLabel={isEmergency ? 'Restore Normal Cycle' : 'Confirm Priority Simulation'}
        variant={isEmergency ? 'warning' : 'primary'}
        onConfirm={() => {
          toggleSignalPriority(signal.signalId, !isEmergency);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
