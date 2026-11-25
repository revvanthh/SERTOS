import React from 'react';
import { KpiRow } from '../components/dashboard/KpiRow';
import { BengaluruTrafficMap } from '../components/map/BengaluruTrafficMap';
import { EmergencyDetailsPanel } from '../components/dashboard/EmergencyDetailsPanel';
import { RouteStatusPanel } from '../components/dashboard/RouteStatusPanel';
import { TrafficSignalControlPanel } from '../components/dashboard/TrafficSignalControlPanel';
import { LiveCctvPanel } from '../components/dashboard/LiveCctvPanel';
import { TrafficOverviewPanel } from '../components/dashboard/TrafficOverviewPanel';
import { PoliceActionsPanel } from '../components/dashboard/PoliceActionsPanel';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Row 1: 4 Interactive KPI Cards */}
      <KpiRow />

      {/* Row 2: Central Live Map + Right Emergency / Route / Signal Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-8">
          <BengaluruTrafficMap heightClass="h-[420px] sm:h-[460px] xl:h-full xl:min-h-[470px]" />
        </div>
        <div className="xl:col-span-4 flex flex-col gap-3.5 justify-between">
          <EmergencyDetailsPanel />
          <RouteStatusPanel />
          <TrafficSignalControlPanel />
        </div>
      </div>

      {/* Row 3: Live CCTV Feed + Traffic Overview Analytics + Police Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <div className="flex-1 flex flex-col">
            <LiveCctvPanel />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <div className="flex-1 flex flex-col">
            <TrafficOverviewPanel />
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <div className="flex-1 flex flex-col">
            <PoliceActionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
