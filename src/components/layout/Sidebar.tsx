import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  TrafficCone,
  Bell,
  Ambulance,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { useSertos } from '../../context/SertosContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { alerts } = useSertos();
  const openAlertsCount = alerts.filter((a) => a.status !== 'Resolved').length;

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/traffic-control', label: 'Traffic Control', icon: TrafficCone },
    {
      to: '/emergency-alerts',
      label: 'Emergency Alerts',
      icon: Bell,
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
    },
    { to: '/ambulance-tracking', label: 'Ambulance Tracking', icon: Ambulance },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <aside className="flex flex-col justify-between h-full w-[232px] bg-[#061326] border-r border-[#1D3552] select-none">
      <div className="pt-4 px-3">
        <div className="flex items-center justify-between lg:hidden mb-3 px-2">
          <span className="text-xs font-semibold text-[#94A3B8]">Navigation</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#0D1D32]"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D084]/20 via-[#00D084]/10 to-transparent text-white border border-[#00D084]/40 shadow-[0_0_18px_rgba(0,208,132,0.12)]'
                      : 'text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32]/80 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                          isActive ? 'text-[#20E39A]' : 'text-[#94A3B8] group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold font-mono-tabular">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Bengaluru Vidhana Soudha civic branding */}
      <div className="relative mt-4 overflow-hidden">
        <div className="relative h-44 w-full">
          <img
            src="/src/assets/images/vidhana_soudha_night_1795629096002.jpg"
            alt="Vidhana Soudha Bengaluru"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061326] via-[#061326]/35 to-[#061326]" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center">
            <p className="text-[15px] font-semibold italic text-[#F1F5F9] leading-tight drop-shadow">
              Safer Bengaluru
            </p>
            <p className="text-[14px] font-medium italic text-[#CBD5E1] leading-tight mt-0.5 drop-shadow">
              Together
            </p>
            <svg
              viewBox="0 0 120 10"
              className="w-24 h-2.5 mx-auto mt-1.5 text-[#20E39A]"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 7C34 2 84 2 114 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile / Tablet drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#020B18]/75 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
