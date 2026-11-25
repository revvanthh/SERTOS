import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Database,
  Lock,
  LogOut,
  Save,
  Shield,
  Sliders,
  User,
} from 'lucide-react';
import { useSertos } from '../context/SertosContext';
import { authService } from '../services/auth/authService';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Settings: React.FC = () => {
  const {
    appMode,
    session,
    cameras,
    settings,
    updateSettings,
    updateOfficerProfile,
    logout,
    addToast,
  } = useSertos();
  const navigate = useNavigate();

  const officer = session?.officer;
  const [name, setName] = useState(officer?.name || '');
  const [phone, setPhone] = useState(officer?.phone || '');
  const [zone, setZone] = useState(officer?.assignedZone || '');
  const [logoutOpen, setLogoutOpen] = useState(false);

  const loginHistory = authService.getLoginHistory();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({ type: 'error', title: 'Officer Name Required' });
      return;
    }
    updateOfficerProfile({
      name: name.trim(),
      phone: phone.trim(),
      assignedZone: zone.trim(),
    });
  };

  const systemServices = [
    {
      name: 'Django Backend API',
      state: appMode === 'LIVE' ? 'Connected' : 'Disconnected (Demo Mode)',
      ok: appMode === 'LIVE',
    },
    {
      name: 'Database Persistence',
      state: appMode === 'LIVE' ? 'Connected' : 'Local Simulation Store',
      ok: false,
    },
    {
      name: 'GPS Telemetry Feed',
      state: appMode === 'LIVE' ? 'Live Feed' : 'Simulated Route Feed (Demo)',
      ok: false,
    },
    {
      name: 'Map Service (OpenStreetMap / CartoDB)',
      state: 'Connected',
      ok: true,
    },
    {
      name: 'Traffic Signal Hardware Integration',
      state: 'Simulation Only (No Physical Control)',
      ok: false,
    },
    {
      name: 'Traffic CCTV Feed',
      state: 'Demo Stream (Local Sample Frames)',
      ok: false,
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-[#F1F5F9]">Settings &amp; System Diagnostics</h1>
        <p className="text-xs text-[#94A3B8]">
          Manage officer profile, dashboard preferences, notification rules, and verify honest service connection states.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Officer Profile */}
        <section className="lg:col-span-6 rounded-xl bg-[#0A1729] border border-[#1D3552] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1D3552]">
            <User className="w-4 h-4 text-[#24A8FF]" />
            <h2 className="text-sm font-bold text-[#F1F5F9]">Officer Profile</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Officer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Officer ID</label>
                <input
                  type="text"
                  disabled
                  value={officer?.officerId || ''}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326]/60 border border-[#1D3552] text-[#94A3B8] font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Role</label>
                <input
                  type="text"
                  disabled
                  value={officer?.role || ''}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326]/60 border border-[#1D3552] text-[#94A3B8]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Traffic Division</label>
                <input
                  type="text"
                  disabled
                  value={officer?.division || ''}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326]/60 border border-[#1D3552] text-[#94A3B8]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Assigned Zone</label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9] focus:outline-none focus:border-[#24A8FF]"
                />
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Contact Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9] font-mono-tabular focus:outline-none focus:border-[#24A8FF]"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00D084] hover:bg-[#20E39A] text-[#020B18] font-bold"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </section>

        {/* Dashboard Preferences */}
        <section className="lg:col-span-6 rounded-xl bg-[#0A1729] border border-[#1D3552] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1D3552]">
            <Sliders className="w-4 h-4 text-[#20E39A]" />
            <h2 className="text-sm font-bold text-[#F1F5F9]">Dashboard Preferences</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94A3B8] mb-1">Default CCTV Camera</label>
                <select
                  value={settings.defaultCctvId}
                  onChange={(e) => updateSettings({ defaultCctvId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9]"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cameraId} — {c.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#94A3B8] mb-1">Simulation Refresh Interval</label>
                <select
                  value={settings.refreshIntervalSec}
                  onChange={(e) =>
                    updateSettings({
                      refreshIntervalSec: Number(e.target.value) as 3 | 5 | 10 | 30,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] text-[#F1F5F9]"
                >
                  <option value={3}>Every 3 seconds</option>
                  <option value={5}>Every 5 seconds</option>
                  <option value={10}>Every 10 seconds</option>
                  <option value={30}>Every 30 seconds</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <p className="font-semibold text-[#CBD5E1]">Default Map Layers</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['defaultTrafficLayer', 'Traffic Flow Overlay'],
                    ['defaultRoutesLayer', 'Emergency Blue Routes'],
                    ['defaultPoliceLayer', 'Police Patrol Units'],
                    ['defaultIncidentsLayer', 'Incident Markers'],
                    ['alertSound', 'Audible Alert Tone'],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#061326] border border-[#1D3552] cursor-pointer"
                  >
                    <span className="text-[#CBD5E1]">{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[key])}
                      onChange={(e) => updateSettings({ [key]: e.target.checked })}
                      className="rounded border-[#1D3552] bg-[#0A1729] text-[#00D084]"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="lg:col-span-6 rounded-xl bg-[#0A1729] border border-[#1D3552] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1D3552]">
            <Bell className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-[#F1F5F9]">Notification Subscriptions</h2>
          </div>

          <div className="space-y-2 text-xs">
            {(
              [
                ['notifyEmergencyAlerts', 'New Emergency Alerts'],
                ['notifyRouteCleared', 'Corridor Route Cleared Confirmations'],
                ['notifyAmbulanceNearing', 'Ambulance Nearing Hospital Alerts'],
                ['notifySignalChanges', 'Traffic Signal Status Changes'],
                ['notifyPoliceUpdates', 'Police Unit Dispatch Updates'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#061326] border border-[#1D3552] cursor-pointer"
              >
                <span className="text-[#CBD5E1]">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(settings[key])}
                  onChange={(e) => updateSettings({ [key]: e.target.checked })}
                  className="rounded border-[#1D3552] bg-[#0A1729] text-[#00D084]"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Honest System Status */}
        <section className="lg:col-span-6 rounded-xl bg-[#0A1729] border border-[#1D3552] p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1D3552]">
            <Database className="w-4 h-4 text-[#20E39A]" />
            <h2 className="text-sm font-bold text-[#F1F5F9]">System Integration Status</h2>
          </div>

          <div className="space-y-2 text-xs">
            {systemServices.map((svc) => (
              <div
                key={svc.name}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[#061326] border border-[#1D3552]"
              >
                <span className="text-[#CBD5E1] font-medium">{svc.name}</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    svc.ok ? 'text-[#20E39A]' : 'text-[#F59E0B]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{svc.state}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Security & Session */}
        <section className="lg:col-span-12 rounded-xl bg-[#0A1729] border border-[#1D3552] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1D3552]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#24A8FF]" />
              <h2 className="text-sm font-bold text-[#F1F5F9]">Security &amp; Session Management</h2>
            </div>

            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/40 text-xs font-bold text-[#FCA5A5]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Session / Log Out</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#F1F5F9]">
                <Lock className="w-4 h-4 text-[#20E39A]" />
                <span>Active Session Details</span>
              </div>
              <p className="text-[#94A3B8]">
                Mode: <strong className="text-[#F59E0B]">{appMode} MODE</strong>
              </p>
              <p className="text-[#94A3B8]">
                Signed In: <span className="font-mono-tabular text-[#F1F5F9]">{session?.loggedInAt}</span>
              </p>
              <p className="text-[#94A3B8]">
                Password updates are disabled in Demo Mode; configure Django JWT endpoints via{' '}
                <code className="text-[#24A8FF]">VITE_API_BASE_URL</code> for production password management.
              </p>
            </div>

            <div className="rounded-lg bg-[#061326] border border-[#1D3552] p-4 space-y-2">
              <p className="font-semibold text-[#F1F5F9]">Recent Login Activity</p>
              {loginHistory.length === 0 ? (
                <p className="text-[#94A3B8]">Current session active.</p>
              ) : (
                <div className="space-y-1.5 max-h-28 overflow-y-auto">
                  {loginHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-[11px] border-b border-[#1D3552]/50 pb-1"
                    >
                      <span className="font-mono-tabular text-[#CBD5E1]">{item.timestamp}</span>
                      <span className="text-[#94A3B8]">{item.mode}</span>
                      <span
                        className={
                          item.status === 'Success' ? 'text-[#20E39A]' : 'text-[#EF4444]'
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Confirm Sign Out"
        description="Sign out of SERTOS Control and return to the login portal?"
        confirmLabel="Log Out"
        variant="danger"
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
          navigate('/login', { replace: true });
        }}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
};
