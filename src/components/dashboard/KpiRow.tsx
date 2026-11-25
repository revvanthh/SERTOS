import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ambulance,
  ArrowDown,
  ArrowUp,
  Car,
  CheckCircle2,
  Clock,
  AlertCircle,
  RadioTower,
} from 'lucide-react';
import { useSertos } from '../../context/SertosContext';

export const KpiRow: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeSignalsCount,
    totalSignalsCount,
    offlineSignalsCount,
    activeEmergenciesCount,
    avgTrafficSpeedKmh,
    avgDelayMin,
  } = useSertos();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* Card 1: Active Signals */}
      <button
        type="button"
        onClick={() => navigate('/traffic-control')}
        className="group text-left rounded-xl bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] hover:border-[#00D084]/50 px-4 py-3.5 transition-all duration-150 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#00D084]/12 border border-[#00D084]/25 flex items-center justify-center shrink-0">
            <RadioTower className="w-5 h-5 text-[#20E39A]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#94A3B8] truncate">Active Signals</p>
            <p className="text-[26px] font-bold text-[#F1F5F9] leading-tight font-mono-tabular mt-0.5">
              {activeSignalsCount} <span className="text-base font-medium text-[#94A3B8]">/ {totalSignalsCount}</span>
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              {offlineSignalsCount} Signals Offline
            </p>
          </div>
        </div>
        <CheckCircle2 className="w-5 h-5 text-[#20E39A] shrink-0" aria-label="Signal network active" />
      </button>

      {/* Card 2: Active Emergencies */}
      <button
        type="button"
        onClick={() => navigate('/emergency-alerts')}
        className="group text-left rounded-xl bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] hover:border-[#EF4444]/50 px-4 py-3.5 transition-all duration-150 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#EF4444]/12 border border-[#EF4444]/25 flex items-center justify-center shrink-0">
            <Ambulance className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#94A3B8] truncate">Active Emergencies</p>
            <p className="text-[26px] font-bold text-[#F1F5F9] leading-tight font-mono-tabular mt-0.5">
              {activeEmergenciesCount}
            </p>
            <p className="text-[11px] text-[#FCA5A5] mt-0.5 truncate">Priority Dispatch Active</p>
          </div>
        </div>
        <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" aria-label="Critical alert active" />
      </button>

      {/* Card 3: Average Traffic Speed */}
      <button
        type="button"
        onClick={() => navigate('/reports')}
        className="group text-left rounded-xl bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] hover:border-[#24A8FF]/50 px-4 py-3.5 transition-all duration-150 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#24A8FF]/12 border border-[#24A8FF]/25 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-[#24A8FF]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#94A3B8] truncate">Avg Traffic Speed</p>
            <p className="text-[26px] font-bold text-[#F1F5F9] leading-tight font-mono-tabular mt-0.5">
              {avgTrafficSpeedKmh} <span className="text-base font-semibold">km/h</span>
            </p>
            <p className="text-[11px] text-[#20E39A] mt-0.5 truncate">+4.2% vs last hour</p>
          </div>
        </div>
        <span className="w-7 h-7 rounded-lg bg-[#00D084]/15 flex items-center justify-center text-[#20E39A] shrink-0">
          <ArrowUp className="w-4 h-4" />
        </span>
      </button>

      {/* Card 4: Average Delay */}
      <button
        type="button"
        onClick={() => navigate('/reports')}
        className="group text-left rounded-xl bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] hover:border-[#20E39A]/50 px-4 py-3.5 transition-all duration-150 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#94A3B8]/12 border border-[#94A3B8]/25 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#CBD5E1]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#94A3B8] truncate">Avg Delay</p>
            <p className="text-[26px] font-bold text-[#F1F5F9] leading-tight font-mono-tabular mt-0.5">
              {avgDelayMin.toFixed(1)} <span className="text-base font-semibold">min</span>
            </p>
            <p className="text-[11px] text-[#20E39A] mt-0.5 truncate">-12% corridor delay</p>
          </div>
        </div>
        <span className="w-7 h-7 rounded-lg bg-[#00D084]/15 flex items-center justify-center text-[#20E39A] shrink-0">
          <ArrowDown className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
};
