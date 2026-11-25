import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity } from 'lucide-react';
import { useSertos } from '../../context/SertosContext';

type MetricType = 'speed' | 'density' | 'delay';

export const TrafficOverviewPanel: React.FC = () => {
  const { trafficSeries } = useSertos();
  const [metric, setMetric] = useState<MetricType>('speed');

  const config = useMemo(() => {
    if (metric === 'density') {
      return {
        dataKey: 'densityIndex' as const,
        unit: '%',
        color: '#F59E0B',
        label: 'Density',
        values: trafficSeries.map((d) => d.densityIndex),
      };
    }
    if (metric === 'delay') {
      return {
        dataKey: 'delayMin' as const,
        unit: 'min',
        color: '#24A8FF',
        label: 'Delay',
        values: trafficSeries.map((d) => d.delayMin),
      };
    }
    return {
      dataKey: 'speedKmh' as const,
      unit: 'km/h',
      color: '#20E39A',
      label: 'Speed',
      values: trafficSeries.map((d) => d.speedKmh),
    };
  }, [metric, trafficSeries]);

  const currentVal = config.values[config.values.length - 1] ?? 0;
  const peakVal = Math.max(...config.values);
  const lowVal = Math.min(...config.values);

  return (
    <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 shadow-md flex flex-col justify-between">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#20E39A]" />
          <h2 className="text-[15px] font-semibold text-[#F1F5F9]">Traffic Overview</h2>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#061326] border border-[#1D3552]">
          {(
            [
              { id: 'speed', label: 'Speed' },
              { id: 'density', label: 'Density' },
              { id: 'delay', label: 'Delay' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMetric(tab.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                metric === tab.id
                  ? 'bg-[#0D1D32] text-white border border-[#1D3552]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center justify-between gap-3 text-xs mb-2 px-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-mono-tabular text-[#F1F5F9]">
            {currentVal} {config.unit}
          </span>
          <span className="text-[11px] text-[#20E39A]">Current {config.label}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#94A3B8] font-mono-tabular">
          <span>
            Peak: <strong className="text-[#F1F5F9]">{peakVal}</strong>
          </span>
          <span>
            Low: <strong className="text-[#F1F5F9]">{lowVal}</strong>
          </span>
        </div>
      </div>

      {/* Recharts AreaChart */}
      <div className="h-[148px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficSeries} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="sertosChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#061326',
                border: '1px solid #1D3552',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F1F5F9',
              }}
              formatter={(value: unknown) => [`${value} ${config.unit}`, config.label]}
            />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={2.5}
              fill="url(#sertosChartFill)"
              activeDot={{ r: 5, stroke: '#020B18', strokeWidth: 2, fill: config.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
