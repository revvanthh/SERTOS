import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from 'recharts';
import {
  Ambulance,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  RadioTower,
  Route,
} from 'lucide-react';
import { getReportDataForRange } from '../data/demoData';
import { useSertos } from '../context/SertosContext';
import { downloadCsvFile, downloadTextFile } from '../utils/csvExport';

type DateRangeKey = 'today' | '7d' | '30d' | 'custom';

export const Reports: React.FC = () => {
  const { alerts, signals, ambulances, policeActions, addToast } = useSertos();

  const [range, setRange] = useState<DateRangeKey>('today');
  const [customStart, setCustomStart] = useState('2026-11-18');
  const [customEnd, setCustomEnd] = useState('2026-11-25');

  const report = useMemo(() => getReportDataForRange(range), [range]);

  const dateTag =
    range === 'custom' ? `${customStart}_to_${customEnd}` : `${range}_${new Date().toISOString().slice(0, 10)}`;

  const handleDownloadFullCsv = () => {
    const combinedRows = [
      ...report.emergenciesByHour.map((row) => ({
        section: 'Emergencies by Hour',
        label: row.hour,
        metric1Name: 'Total Emergencies',
        metric1Value: row.emergencies,
        metric2Name: 'Resolved',
        metric2Value: row.resolved,
      })),
      ...report.speedTrend.map((row) => ({
        section: 'Traffic Speed Trend',
        label: row.label,
        metric1Name: 'Corridor Speed (km/h)',
        metric1Value: row.speedKmh,
        metric2Name: 'Baseline (km/h)',
        metric2Value: row.baselineKmh,
      })),
      ...report.densityByZone.map((row) => ({
        section: 'Traffic Density by Zone',
        label: row.zone,
        metric1Name: 'Smooth (%)',
        metric1Value: row.smooth,
        metric2Name: 'Heavy (%)',
        metric2Value: row.heavy,
      })),
      ...report.responseTimeTrend.map((row) => ({
        section: 'Ambulance Response Time',
        label: row.label,
        metric1Name: 'Avg Response (min)',
        metric1Value: row.avgMinutes,
        metric2Name: 'Target (min)',
        metric2Value: row.targetMinutes,
      })),
      ...report.emergencyTypeDistribution.map((row) => ({
        section: 'Emergency Type Distribution',
        label: row.type,
        metric1Name: 'Case Count',
        metric1Value: row.count,
        metric2Name: 'Range',
        metric2Value: range,
      })),
      ...report.policeUnitResponse.map((row) => ({
        section: 'Police Unit Response',
        label: row.unit,
        metric1Name: 'Clearances',
        metric1Value: row.clearances,
        metric2Name: 'Avg Dispatch (sec)',
        metric2Value: row.avgDispatchSec,
      })),
    ];

    const count = downloadCsvFile(`sertos-analytics-report-${dateTag}.csv`, combinedRows, [
      { key: 'section', header: 'Report Section' },
      { key: 'label', header: 'Dimension / Time / Zone' },
      { key: 'metric1Name', header: 'Primary Metric' },
      { key: 'metric1Value', header: 'Primary Value' },
      { key: 'metric2Name', header: 'Secondary Metric' },
      { key: 'metric2Value', header: 'Secondary Value' },
    ]);

    addToast({
      type: 'success',
      title: 'Analytics CSV Downloaded',
      description: `Exported ${count} report rows for range "${range}".`,
    });
  };

  const handleExportAlertsCsv = () => {
    const count = downloadCsvFile(
      `sertos-emergencies-${dateTag}.csv`,
      alerts.map((a) => ({
        incidentId: a.incidentId,
        type: a.type,
        patientSummary: a.patientSummary,
        location: a.location,
        zone: a.zone,
        hospital: a.hospital,
        priority: a.priority,
        ambulanceId: a.ambulanceId,
        etaMinutes: a.etaMinutes,
        status: a.status,
        assignedPoliceUnit: a.assignedPoliceUnit || 'Unassigned',
        timeReceived: a.timeReceived,
      })),
      [
        { key: 'incidentId', header: 'Incident ID' },
        { key: 'type', header: 'Type' },
        { key: 'patientSummary', header: 'Patient' },
        { key: 'location', header: 'Location' },
        { key: 'zone', header: 'Zone' },
        { key: 'hospital', header: 'Hospital' },
        { key: 'priority', header: 'Priority' },
        { key: 'ambulanceId', header: 'Ambulance' },
        { key: 'etaMinutes', header: 'ETA (min)' },
        { key: 'status', header: 'Status' },
        { key: 'assignedPoliceUnit', header: 'Assigned Unit' },
        { key: 'timeReceived', header: 'Time Received' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Emergency Logs CSV Exported',
      description: `Downloaded ${count} emergency records.`,
    });
  };

  const handleExportSignalsCsv = () => {
    const count = downloadCsvFile(
      `sertos-signals-${dateTag}.csv`,
      signals.map((s) => ({
        signalId: s.signalId,
        location: s.location,
        zone: s.zone,
        currentLight: s.currentLight,
        trafficDensity: s.trafficDensity,
        mode: s.mode,
        status: s.status,
        trafficVolumePerHour: s.trafficVolumePerHour,
        lastUpdate: s.lastUpdate,
      })),
      [
        { key: 'signalId', header: 'Signal ID' },
        { key: 'location', header: 'Location' },
        { key: 'zone', header: 'Zone' },
        { key: 'currentLight', header: 'Light' },
        { key: 'trafficDensity', header: 'Density' },
        { key: 'mode', header: 'Mode' },
        { key: 'status', header: 'Status' },
        { key: 'trafficVolumePerHour', header: 'Volume/hr' },
        { key: 'lastUpdate', header: 'Last Update' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Signal Telemetry CSV Exported',
      description: `Downloaded ${count} signal records.`,
    });
  };

  const handleExportActionsCsv = () => {
    const count = downloadCsvFile(
      `sertos-police-actions-${dateTag}.csv`,
      policeActions.map((act) => ({
        id: act.id,
        title: act.title,
        description: act.description,
        status: act.status,
        timestamp: act.timestamp,
        officer: act.officer,
        incidentId: act.incidentId || '',
      })),
      [
        { key: 'id', header: 'Action ID' },
        { key: 'title', header: 'Action' },
        { key: 'description', header: 'Description' },
        { key: 'status', header: 'Status' },
        { key: 'timestamp', header: 'Timestamp' },
        { key: 'officer', header: 'Officer' },
        { key: 'incidentId', header: 'Incident ID' },
      ]
    );
    addToast({
      type: 'success',
      title: 'Police Actions CSV Exported',
      description: `Downloaded ${count} action log entries.`,
    });
  };

  const handleExportSummaryReport = () => {
    const lines = [
      'SERTOS — BENGALURU TRAFFIC POLICE OPERATIONS REPORT (DEMO DATA)',
      `Generated: ${new Date().toISOString()}`,
      `Date Range: ${range === 'custom' ? `${customStart} to ${customEnd}` : range}`,
      '------------------------------------------------------------',
      `Emergencies Today / Selected Period: ${report.kpis.emergenciesToday}`,
      `Average Ambulance Response: ${report.kpis.avgResponseMin} min`,
      `Routes Cleared: ${report.kpis.routesCleared}`,
      `Signal Optimizations: ${report.kpis.signalOptimizations}`,
      `Active Tracked Ambulances: ${ambulances.length}`,
      `Monitored Signals: ${signals.length}`,
      '',
      'EMERGENCY INCIDENTS:',
      ...alerts.map(
        (a) =>
          `- ${a.incidentId} | ${a.type} | ${a.priority} | ${a.status} | ${a.ambulanceId} -> ${a.hospital}`
      ),
    ];
    downloadTextFile(`sertos-operations-report-${dateTag}.txt`, lines.join('\n'));
    addToast({
      type: 'success',
      title: 'Operations Report Exported',
      description: 'Downloaded formatted summary report.',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header + Date Filters + Primary CSV Export */}
      <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F1F5F9]">Reports &amp; Traffic Analytics</h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Operational corridor performance &amp; CSV data exports (Demo Analytics Dataset).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#061326] border border-[#1D3552]">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 days' },
                { id: '30d', label: 'Last 30 days' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRange(opt.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  range === opt.id
                    ? 'bg-[#0D1D32] text-white border border-[#1D3552]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {range === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                aria-label="Start date"
                className="px-2 py-1.5 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9]"
              />
              <span className="text-[#94A3B8]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                aria-label="End date"
                className="px-2 py-1.5 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9]"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleDownloadFullCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] text-xs font-bold whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportSummaryReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1D32] hover:bg-[#162B47] border border-[#1D3552] text-xs font-semibold text-[#F1F5F9] whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-[#24A8FF]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Dedicated CSV Export Strip for All Datasets */}
      <div className="rounded-xl bg-[#061326] border border-[#1D3552] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#CBD5E1]">
          <FileSpreadsheet className="w-4 h-4 text-[#20E39A]" />
          <span className="font-semibold">Granular CSV Exports:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportAlertsCsv}
            className="px-3 py-1.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-xs font-medium text-[#CBD5E1] hover:text-white transition-colors"
          >
            Emergency Logs CSV ({alerts.length})
          </button>
          <button
            type="button"
            onClick={handleExportSignalsCsv}
            className="px-3 py-1.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-xs font-medium text-[#CBD5E1] hover:text-white transition-colors"
          >
            Signal Telemetry CSV ({signals.length})
          </button>
          <button
            type="button"
            onClick={handleExportActionsCsv}
            className="px-3 py-1.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-xs font-medium text-[#CBD5E1] hover:text-white transition-colors"
          >
            Police Actions CSV ({policeActions.length})
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center">
            <Ambulance className="w-5 h-5 text-[#EF4444]" />
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Emergencies ({range})</p>
            <p className="text-2xl font-bold font-mono-tabular text-[#F1F5F9]">
              {report.kpis.emergenciesToday}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#24A8FF]/15 border border-[#24A8FF]/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#24A8FF]" />
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Avg Ambulance Response</p>
            <p className="text-2xl font-bold font-mono-tabular text-[#F1F5F9]">
              {report.kpis.avgResponseMin} min
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center">
            <Route className="w-5 h-5 text-[#20E39A]" />
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Routes Cleared</p>
            <p className="text-2xl font-bold font-mono-tabular text-[#F1F5F9]">
              {report.kpis.routesCleared}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
            <RadioTower className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-xs text-[#94A3B8]">Signal Optimizations</p>
            <p className="text-2xl font-bold font-mono-tabular text-[#F1F5F9]">
              {report.kpis.signalOptimizations}
            </p>
          </div>
        </div>
      </div>

      {/* 6 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Emergencies by Hour */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">Emergencies by Hour</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.emergenciesByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="emergencies" name="Total" fill="#24A8FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#20E39A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. Traffic Speed Trend */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">Traffic Speed Trend (km/h)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.speedTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="speedKmh"
                  name="Corridor Speed"
                  stroke="#20E39A"
                  fill="#20E39A"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="baselineKmh"
                  name="Baseline"
                  stroke="#94A3B8"
                  fill="#94A3B8"
                  fillOpacity={0.08}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. Traffic Density by Zone */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">Traffic Density by Zone (%)</h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.densityByZone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" vertical={false} />
                <XAxis dataKey="zone" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="smooth" stackId="a" name="Smooth" fill="#20E39A" />
                <Bar dataKey="moderate" stackId="a" name="Moderate" fill="#F59E0B" />
                <Bar dataKey="heavy" stackId="a" name="Heavy" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. Ambulance Response Time */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">
            Ambulance Response Time (min)
          </h2>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.responseTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="avgMinutes"
                  name="Avg Response"
                  stroke="#24A8FF"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="targetMinutes"
                  name="SLA Target"
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 5. Emergency Type Distribution */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <h2 className="text-sm font-semibold text-[#F1F5F9] mb-3">
            Emergency Type Distribution
          </h2>
          <div className="h-60 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.emergencyTypeDistribution}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {report.emergencyTypeDistribution.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 6. Police Unit Response */}
        <section className="rounded-xl bg-[#0A1729] border border-[#1D3552] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#F1F5F9]">Police Unit Clearances</h2>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#20E39A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Escort Units</span>
            </span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.policeUnitResponse} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D3552" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis
                  dataKey="unit"
                  type="category"
                  tick={{ fill: '#CBD5E1', fontSize: 11 }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#061326',
                    border: '1px solid #1D3552',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="clearances" name="Routes Cleared" fill="#00D084" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
