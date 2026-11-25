import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Radio,
  Settings,
  ShieldCheck,
  User,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useSertos } from '../../context/SertosContext';
import { formatIstTime } from '../../utils/time';
import { BengaluruPoliceEmblem, SertosLogo } from '../common/BrandLogos';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
}

const ROUTE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard': { title: 'Command Dashboard', breadcrumb: 'Operations / Live Overview' },
  '/traffic-control': { title: 'Traffic Control', breadcrumb: 'Operations / Signal Network' },
  '/emergency-alerts': { title: 'Emergency Alerts', breadcrumb: 'Dispatch / Active Incidents' },
  '/ambulance-tracking': { title: 'Ambulance Tracking', breadcrumb: 'Fleet / Corridor Monitor' },
  '/reports': { title: 'Reports & Analytics', breadcrumb: 'Analytics / CSV Export' },
  '/settings': { title: 'System Settings', breadcrumb: 'Control / Preferences & Status' },
};

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    appMode,
    session,
    logout,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useSertos();

  const location = useLocation();
  const navigate = useNavigate();

  const [istClock, setIstClock] = useState<string>(() => formatIstTime());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIstClock(formatIstTime());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeMeta = ROUTE_TITLES[location.pathname] || ROUTE_TITLES['/dashboard'];
  const officer = session?.officer;

  const handleConfirmLogout = () => {
    setLogoutDialogOpen(false);
    setProfileOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="h-[68px] shrink-0 bg-[#061326] border-b border-[#1D3552] px-3 sm:px-5 flex items-center justify-between gap-3 z-30">
        {/* Left: Mobile toggle + Bengaluru Police & SERTOS Lockup */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <BengaluruPoliceEmblem className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-bold tracking-wide text-[#F1F5F9]">
                BENGALURU
              </div>
              <div className="text-[13px] font-bold tracking-wide text-[#F1F5F9]">
                TRAFFIC POLICE
              </div>
            </div>
          </div>

          <div className="hidden md:block h-8 w-px bg-[#1D3552] mx-1" aria-hidden="true" />

          <div className="hidden md:block min-w-0">
            <SertosLogo />
          </div>

          <div className="md:hidden min-w-0">
            <p className="text-sm font-bold text-[#F1F5F9] truncate">{routeMeta.title}</p>
            <p className="text-[11px] text-[#94A3B8] truncate">{routeMeta.breadcrumb}</p>
          </div>
        </div>

        {/* Center/Left contextual breadcrumb on wide screens */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0A1729] border border-[#1D3552]/80 text-xs">
          <span className="font-semibold text-[#F1F5F9] whitespace-nowrap">{routeMeta.title}</span>
          <span className="text-[#475569]">/</span>
          <span className="text-[#94A3B8] whitespace-nowrap">{routeMeta.breadcrumb}</span>
        </div>

        {/* Right: Mode Indicator + IST Clock + Notification Bell + Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status + IST Clock */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0A1729] border border-[#1D3552]">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${
                appMode === 'LIVE' ? 'text-[#20E39A]' : 'text-[#F59E0B]'
              }`}
              title={
                appMode === 'LIVE'
                  ? 'Connected to SERTOS backend'
                  : 'Running in Demo Mode with simulated telemetry'
              }
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span>{appMode === 'LIVE' ? 'Live' : 'Demo Mode'}</span>
            </span>
            <span className="h-3.5 w-px bg-[#1D3552]" aria-hidden="true" />
            <span
              className="font-mono-tabular text-xs sm:text-[13px] font-semibold text-[#F1F5F9] whitespace-nowrap"
              title="Bengaluru / India Standard Time (IST)"
            >
              {istClock} <span className="hidden sm:inline text-[#94A3B8] font-normal">IST</span>
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="relative p-2.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] text-[#CBD5E1] hover:text-white transition-colors"
              aria-label="Open notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold font-mono-tabular flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1D3552] bg-[#061326]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F1F5F9]">Notification Center</h3>
                    <p className="text-[11px] text-[#94A3B8]">
                      {unreadNotificationsCount} unread · {appMode} feed
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      disabled={unreadNotificationsCount === 0}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#20E39A] hover:bg-[#0D1D32] disabled:opacity-40 transition-colors"
                      title="Mark all as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Read all</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearNotifications}
                      disabled={notifications.length === 0}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#0D1D32] disabled:opacity-40 transition-colors"
                      title="Clear notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#1D3552]/70">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-[#94A3B8]">
                      No active notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 transition-colors hover:bg-[#0D1D32]/80 ${
                          !n.read ? 'bg-[#0D1D32]/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              markNotificationRead(n.id);
                              setNotifOpen(false);
                              navigate(n.targetRoute);
                            }}
                            className="text-left flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                              <span
                                className={`font-semibold ${
                                  n.category === 'New Emergency'
                                    ? 'text-[#EF4444]'
                                    : n.category === 'Route Cleared'
                                    ? 'text-[#20E39A]'
                                    : 'text-[#24A8FF]'
                                }`}
                              >
                                {n.category}
                              </span>
                              <span>·</span>
                              <span className="font-mono-tabular">{n.timestamp}</span>
                            </div>
                            <p className="text-xs font-semibold text-[#F1F5F9] mt-0.5 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          </button>
                          {!n.read && (
                            <button
                              type="button"
                              onClick={() => markNotificationRead(n.id)}
                              className="shrink-0 text-[10px] font-medium text-[#20E39A] hover:underline mt-0.5"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Officer Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-[#0A1729] hover:bg-[#0D1D32] border border-[#1D3552] transition-colors"
              aria-expanded={profileOpen}
              aria-label="Officer profile menu"
            >
              <span className="w-7 h-7 rounded-full bg-[#163155] border border-[#24A8FF]/40 flex items-center justify-center text-[#24A8FF]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="hidden sm:block text-left leading-tight">
                <span className="block text-xs font-semibold text-[#F1F5F9] whitespace-nowrap">
                  {officer?.role || 'Traffic Inspector'}
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0A1729] border border-[#1D3552] shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3.5 bg-[#061326] border-b border-[#1D3552]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#F1F5F9] truncate">
                      {officer?.name}
                    </p>
                    <span className="text-[11px] font-semibold text-[#20E39A] whitespace-nowrap">
                      {officer?.accountStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {officer?.role} · ID {officer?.officerId}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1 truncate">
                    Zone: {officer?.assignedZone}
                  </p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] transition-colors"
                  >
                    <User className="w-4 h-4 text-[#94A3B8]" />
                    <span>Officer Profile &amp; Zone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#CBD5E1] hover:text-white hover:bg-[#0D1D32] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#94A3B8]" />
                    <span>Dashboard Settings</span>
                  </button>
                  <div className="my-1 border-t border-[#1D3552]" />
                  <button
                    type="button"
                    onClick={() => setLogoutDialogOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={logoutDialogOpen}
        title="Confirm Officer Sign Out"
        description="Are you sure you want to end your SERTOS control room session? Active telemetry polling will stop and you will return to the login screen."
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutDialogOpen(false)}
      />
    </>
  );
};
