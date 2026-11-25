import React, { useState } from 'react';
import { CheckCircle2, Loader2, Shield, ShieldCheck, X } from 'lucide-react';
import { useSertos } from '../../context/SertosContext';
import { PoliceActionItem } from '../../types/sertos';

export const PoliceActionsPanel: React.FC = () => {
  const { policeActions, primaryAlert, executeClearEmergencyRoute } = useSertos();
  const [selectedAction, setSelectedAction] = useState<PoliceActionItem | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [simulationStep, setSimulationStep] = useState<'confirm' | 'running' | 'done'>('confirm');
  const [progress, setProgress] = useState(0);

  const visibleActions = policeActions.slice(0, 4);

  const startClearSimulation = () => {
    setSimulationStep('running');
    setProgress(20);
    window.setTimeout(() => setProgress(55), 350);
    window.setTimeout(() => setProgress(85), 700);
    window.setTimeout(() => {
      setProgress(100);
      executeClearEmergencyRoute(primaryAlert.incidentId);
      setSimulationStep('done');
    }, 1100);
  };

  const closeClearModal = () => {
    setClearModalOpen(false);
    setSimulationStep('confirm');
    setProgress(0);
  };

  return (
    <>
      <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#1D3552]/80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#CBD5E1]" />
              <h2 className="text-[15px] font-semibold text-[#F1F5F9]">Police Actions</h2>
            </div>
            <span className="text-[11px] font-mono-tabular text-[#94A3B8]">
              {policeActions.length} logged
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {visibleActions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => setSelectedAction(act)}
                className="w-full text-left flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#0D1D32] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {act.status === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#20E39A] shrink-0" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-[#24A8FF] animate-spin shrink-0" />
                  )}
                  <span className="text-xs font-medium text-[#E2E8F0] truncate">
                    {act.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono-tabular text-[#64748B] shrink-0">
                  {act.timestamp}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSimulationStep('confirm');
            setProgress(0);
            setClearModalOpen(true);
          }}
          className="mt-3 w-full py-2.5 px-3 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Clear Emergency Route</span>
        </button>
      </section>

      {/* Action Detail Modal */}
      {selectedAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#061326] border-b border-[#1D3552]">
              <h3 className="text-sm font-bold text-[#F1F5F9]">Police Action Detail</h3>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="p-1 rounded text-[#94A3B8] hover:text-white"
                aria-label="Close action detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div>
                <p className="text-[#94A3B8]">Action</p>
                <p className="text-sm font-semibold text-[#F1F5F9] mt-0.5">
                  {selectedAction.title}
                </p>
              </div>
              <div>
                <p className="text-[#94A3B8]">Details</p>
                <p className="text-[#CBD5E1] mt-0.5 leading-relaxed">
                  {selectedAction.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[#94A3B8]">Timestamp</p>
                  <p className="font-mono-tabular text-[#F1F5F9]">{selectedAction.timestamp}</p>
                </div>
                <div>
                  <p className="text-[#94A3B8]">Authorized By</p>
                  <p className="text-[#F1F5F9]">{selectedAction.officer}</p>
                </div>
              </div>
              {selectedAction.affectedSignals && (
                <div>
                  <p className="text-[#94A3B8] mb-1">Affected Signals (Simulated)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAction.affectedSignals.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-[#0D1D32] border border-[#1D3552] font-mono-tabular text-[#20E39A]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear Emergency Route Interactive Simulation Modal */}
      {clearModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B18]/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Clear emergency route simulation"
        >
          <div className="w-full max-w-lg rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-[#061326] border-b border-[#1D3552]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#20E39A]" />
                <h3 className="text-base font-bold text-[#F1F5F9]">
                  Clear Emergency Route ({primaryAlert.incidentId})
                </h3>
              </div>
              <button
                type="button"
                onClick={closeClearModal}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1D32]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="rounded-lg bg-[#0D1D32] border border-[#1D3552] p-3.5 space-y-2">
                <p className="font-semibold text-[#F1F5F9]">
                  Simulated Route Analysis — {primaryAlert.hospital} Corridor
                </p>
                <p className="text-[#94A3B8]">
                  Ambulance <span className="font-mono-tabular text-[#24A8FF]">{primaryAlert.ambulanceId}</span> · MG Road → Brigade Junction → Trinity Circle → VVIT Hospital
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-[#94A3B8]">Affected Signal Locations</p>
                    <p className="text-[#20E39A] font-medium mt-0.5">
                      MG Road (SIG-MG-01), Trinity Circle (SIG-TC-03)
                    </p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Police Units Notified</p>
                    <p className="text-[#F1F5F9] font-mono-tabular mt-0.5">
                      BTP-UNIT-07, BTP-UNIT-12
                    </p>
                  </div>
                </div>
              </div>

              {simulationStep === 'confirm' && (
                <div className="rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-3.5 py-2.5 text-[#FDE68A]">
                  Demo Mode Notice: Confirming executes a simulated green corridor optimization without controlling physical traffic hardware.
                </div>
              )}

              {simulationStep !== 'confirm' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#CBD5E1]">
                      {simulationStep === 'running'
                        ? 'Optimizing corridor signal phases & notifying patrol units...'
                        : 'Corridor Clearance Simulation Complete'}
                    </span>
                    <span className="font-mono-tabular font-bold text-[#20E39A]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#061326] overflow-hidden border border-[#1D3552]">
                    <div
                      className="h-full bg-[#20E39A] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#061326] border-t border-[#1D3552]">
              {simulationStep === 'confirm' && (
                <>
                  <button
                    type="button"
                    onClick={closeClearModal}
                    className="px-4 py-2 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-xs font-medium text-[#CBD5E1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={startClearSimulation}
                    className="px-4 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold"
                  >
                    Execute Route Clearance
                  </button>
                </>
              )}
              {simulationStep === 'done' && (
                <button
                  type="button"
                  onClick={closeClearModal}
                  className="px-4 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
