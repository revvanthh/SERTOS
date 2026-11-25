import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ENV_CONFIG } from '../config/env';
import {
  DEFAULT_SETTINGS,
  DEMO_AMBULANCES,
  DEMO_CCTV_CAMERAS,
  DEMO_EMERGENCY_ALERTS,
  DEMO_NOTIFICATIONS,
  DEMO_POLICE_ACTIONS,
  DEMO_POLICE_UNITS,
  DEMO_ROAD_CORRIDORS,
  DEMO_SIGNALS,
  DEMO_TRAFFIC_SERIES,
} from '../data/demoData';
import { apiClient } from '../services/api/client';
import { authService, LoginPayload } from '../services/auth/authService';
import {
  AmbulanceStatus,
  AmbulanceUnit,
  AppMode,
  AppNotification,
  AuthSession,
  CctvCamera,
  DashboardSettings,
  EmergencyAlert,
  OfficerProfile,
  PoliceActionItem,
  PoliceUnit,
  RoadCorridor,
  SignalLight,
  ToastMessage,
  TrafficMetricPoint,
  TrafficSignal,
} from '../types/sertos';
import { formatIstTime } from '../utils/time';

interface SertosContextValue {
  // Mode & Auth
  appMode: AppMode;
  session: AuthSession | null;
  isAuthenticated: boolean;
  logoutNotice: string | null;
  clearLogoutNotice: () => void;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  updateOfficerProfile: (updates: Partial<OfficerProfile>) => void;

  // Domain Data
  alerts: EmergencyAlert[];
  ambulances: AmbulanceUnit[];
  signals: TrafficSignal[];
  policeUnits: PoliceUnit[];
  roadCorridors: RoadCorridor[];
  policeActions: PoliceActionItem[];
  cameras: CctvCamera[];
  trafficSeries: TrafficMetricPoint[];
  notifications: AppNotification[];
  settings: DashboardSettings;

  // Selected Items
  primaryAlert: EmergencyAlert;
  primaryAmbulance: AmbulanceUnit;
  selectedAmbulanceId: string;
  setSelectedAmbulanceId: (id: string) => void;

  // Derived KPIs
  activeSignalsCount: number;
  totalSignalsCount: number;
  offlineSignalsCount: number;
  activeEmergenciesCount: number;
  avgTrafficSpeedKmh: number;
  avgDelayMin: number;
  unreadNotificationsCount: number;

  // Actions
  acknowledgeAlert: (alertId: string) => void;
  assignPoliceUnit: (alertId: string, unitCode: string) => void;
  notifyNearbyUnits: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  toggleSignalPriority: (signalId: string, enable: boolean) => void;
  switchSignalLight: (signalId: string, light: SignalLight) => void;
  executeClearEmergencyRoute: (incidentId?: string) => void;
  advanceAmbulanceSimulation: (ambulanceId: string) => void;
  refreshOperationalData: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  updateSettings: (updates: Partial<DashboardSettings>) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const SertosContext = createContext<SertosContextValue | undefined>(undefined);

function interpolateRoutePosition(
  waypoints: [number, number][],
  progress: number
): [number, number] {
  if (waypoints.length === 0) return [12.9742, 77.6145];
  if (waypoints.length === 1 || progress <= 0) return waypoints[0];
  if (progress >= 1) return waypoints[waypoints.length - 1];

  const totalSegments = waypoints.length - 1;
  const scaled = progress * totalSegments;
  const idx = Math.min(totalSegments - 1, Math.floor(scaled));
  const segT = scaled - idx;
  const [lat1, lng1] = waypoints[idx];
  const [lat2, lng2] = waypoints[idx + 1];
  return [lat1 + (lat2 - lat1) * segT, lng1 + (lng2 - lng1) * segT];
}

function deriveStagesForProgress(
  progress: number,
  existing: AmbulanceUnit['stages']
): { status: AmbulanceStatus; stages: AmbulanceUnit['stages'] } {
  const nowShort = formatIstTime(new Date(), false);
  if (progress >= 0.99) {
    return {
      status: 'Arrived',
      stages: [
        { ...existing[0], completed: true, active: false },
        { ...existing[1], time: existing[1].time || nowShort, completed: true, active: false },
        { ...existing[2], time: existing[2].time || nowShort, completed: true, active: false },
        { label: 'Hospital Arrived', time: nowShort, completed: true, active: true },
      ],
    };
  }
  if (progress >= 0.72) {
    return {
      status: 'Approaching Hospital',
      stages: [
        { ...existing[0], completed: true, active: false },
        { ...existing[1], time: existing[1].time || nowShort, completed: true, active: false },
        { label: 'Arriving Soon', time: existing[2].time || nowShort, completed: true, active: true },
        { label: 'Hospital Arrived', completed: false, active: false },
      ],
    };
  }
  if (progress >= 0.25) {
    return {
      status: 'En Route',
      stages: [
        { ...existing[0], completed: true, active: false },
        { label: 'On Route', time: existing[1].time || nowShort, completed: true, active: true },
        { label: 'Arriving Soon', time: existing[2].time, completed: false, active: false },
        { label: 'Hospital Arrived', completed: false, active: false },
      ],
    };
  }
  return {
    status: 'Dispatched',
    stages: [
      { ...existing[0], completed: true, active: true },
      { label: 'On Route', completed: false, active: false },
      { label: 'Arriving Soon', completed: false, active: false },
      { label: 'Hospital Arrived', completed: false, active: false },
    ],
  };
}

export const SertosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getActiveSession());
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() =>
    structuredClone(DEMO_EMERGENCY_ALERTS)
  );
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(() =>
    structuredClone(DEMO_AMBULANCES)
  );
  const [signals, setSignals] = useState<TrafficSignal[]>(() => structuredClone(DEMO_SIGNALS));
  const [policeUnits, setPoliceUnits] = useState<PoliceUnit[]>(() =>
    structuredClone(DEMO_POLICE_UNITS)
  );
  const [roadCorridors] = useState<RoadCorridor[]>(() => structuredClone(DEMO_ROAD_CORRIDORS));
  const [policeActions, setPoliceActions] = useState<PoliceActionItem[]>(() =>
    structuredClone(DEMO_POLICE_ACTIONS)
  );
  const [cameras] = useState<CctvCamera[]>(() => structuredClone(DEMO_CCTV_CAMERAS));
  const [trafficSeries, setTrafficSeries] = useState<TrafficMetricPoint[]>(() =>
    structuredClone(DEMO_TRAFFIC_SERIES)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    structuredClone(DEMO_NOTIFICATIONS)
  );
  const [settings, setSettings] = useState<DashboardSettings>(() => ({ ...DEFAULT_SETTINGS }));
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('SRT-1047');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastTimersRef = useRef<number[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, 4500);
      toastTimersRef.current.push(timer);
    },
    [dismissToast]
  );

  const resetProtectedState = useCallback(() => {
    setAlerts(structuredClone(DEMO_EMERGENCY_ALERTS));
    setAmbulances(structuredClone(DEMO_AMBULANCES));
    setSignals(structuredClone(DEMO_SIGNALS));
    setPoliceUnits(structuredClone(DEMO_POLICE_UNITS));
    setPoliceActions(structuredClone(DEMO_POLICE_ACTIONS));
    setTrafficSeries(structuredClone(DEMO_TRAFFIC_SERIES));
    setNotifications(structuredClone(DEMO_NOTIFICATIONS));
    setSelectedAmbulanceId('SRT-1047');
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setSession(null);
    resetProtectedState();
    setLogoutNotice('Logged out successfully');
  }, [resetProtectedState]);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(() => {
      authService.clearSession();
      setSession(null);
      setLogoutNotice('Session expired. Please sign in again.');
    });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const newSession = await authService.login(payload);
    setLogoutNotice(null);
    setSession(newSession);
  }, []);

  const clearLogoutNotice = useCallback(() => {
    setLogoutNotice(null);
  }, []);

  const updateOfficerProfile = useCallback(
    (updates: Partial<OfficerProfile>) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next: AuthSession = {
          ...prev,
          officer: { ...prev.officer, ...updates },
        };
        authService.persistSession(
          next,
          Boolean(authService.getRememberedIdentifier()),
          next.officer.officerId
        );
        return next;
      });
      addToast({
        type: 'success',
        title: 'Officer Profile Updated',
        description: 'Profile changes saved to current control session.',
      });
    },
    [addToast]
  );

  // Simulation loop: ONLY runs while authenticated! Cleans up cleanly on logout.
  useEffect(() => {
    if (!session) return;

    const signalTimer = window.setInterval(() => {
      setSignals((prev) =>
        prev.map((sig) => {
          if (sig.status !== 'Active') return sig;
          if (sig.countdownSeconds > 1) {
            return { ...sig, countdownSeconds: sig.countdownSeconds - 1 };
          }
          // Cycle signal phase cleanly when countdown reaches 0
          if (sig.mode === 'Emergency Priority') {
            return {
              ...sig,
              currentLight: 'Green',
              countdownSeconds: 45,
              lastUpdate: formatIstTime(),
            };
          }
          const nextLight: SignalLight =
            sig.currentLight === 'Green'
              ? 'Yellow'
              : sig.currentLight === 'Yellow'
              ? 'Red'
              : 'Green';
          const nextDuration = nextLight === 'Yellow' ? 5 : nextLight === 'Green' ? 50 : 55;
          return {
            ...sig,
            currentLight: nextLight,
            countdownSeconds: nextDuration,
            lastUpdate: formatIstTime(),
          };
        })
      );
    }, 1000);

    const refreshMs = settings.refreshIntervalSec * 1000;
    const simTimer = window.setInterval(() => {
      const nowStr = formatIstTime();

      setAmbulances((prev) =>
        prev.map((amb) => {
          if (amb.status === 'Arrived' || amb.status === 'Completed') return amb;
          // Gentle progressive movement along route, looping back smoothly if reaching 0.96 so demo stays alive unless explicitly arrived
          let nextProgress = amb.routeProgress + 0.018;
          if (nextProgress >= 0.96 && amb.ambulanceId === 'SRT-1047') {
            nextProgress = 0.28;
          } else if (nextProgress >= 0.98) {
            nextProgress = 0.98;
          }
          const nextCoords = interpolateRoutePosition(amb.routeWaypoints, nextProgress);
          const remainingRatio = Math.max(0.05, 1 - nextProgress);
          const nextDist = Number((remainingRatio * 2.2).toFixed(1));
          const nextEta = Math.max(1, Math.round(remainingRatio * 4.5));
          const derived = deriveStagesForProgress(nextProgress, amb.stages);
          return {
            ...amb,
            routeProgress: nextProgress,
            currentCoords: nextCoords,
            distanceRemainingKm: nextDist,
            etaMinutes: nextEta,
            speedKmh: Math.max(28, Math.min(54, amb.speedKmh + (Math.random() > 0.5 ? 1 : -1))),
            status: derived.status,
            stages: derived.stages,
            lastUpdated: nowStr,
          };
        })
      );
    }, refreshMs);

    return () => {
      window.clearInterval(signalTimer);
      window.clearInterval(simTimer);
    };
  }, [session, settings.refreshIntervalSec]);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const pushNotification = useCallback(
    (item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
      setNotifications((prev) => [
        {
          ...item,
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          timestamp: formatIstTime(),
          read: false,
        },
        ...prev,
      ]);
    },
    []
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';
      let targetIncident = '';

      setAlerts((prev) =>
        prev.map((a) => {
          if (a.id !== alertId) return a;
          targetIncident = a.incidentId;
          return {
            ...a,
            status: a.status === 'New' ? 'Acknowledged' : a.status,
            timeline: [
              ...a.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: now,
                title: 'Alert Acknowledged',
                detail: `Acknowledged by ${officerName} in SERTOS Command.`,
                actor: officerName,
              },
            ],
          };
        })
      );

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: `Alert ${targetIncident} Acknowledged`,
          description: `Emergency incident ${targetIncident} acknowledged by ${officerName}.`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          incidentId: targetIncident,
        },
        ...prev,
      ]);

      pushNotification({
        category: 'Police Unit Assigned',
        title: `Alert ${targetIncident} Acknowledged`,
        message: `${officerName} acknowledged emergency incident ${targetIncident}.`,
        targetRoute: '/emergency-alerts',
        incidentId: targetIncident,
      });

      addToast({
        type: 'success',
        title: 'Alert Acknowledged',
        description: `${targetIncident} updated and logged to action history.`,
      });
    },
    [session, pushNotification, addToast]
  );

  const assignPoliceUnit = useCallback(
    (alertId: string, unitCode: string) => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';
      let targetIncident = '';

      setAlerts((prev) =>
        prev.map((a) => {
          if (a.id !== alertId) return a;
          targetIncident = a.incidentId;
          return {
            ...a,
            assignedPoliceUnit: unitCode,
            status: a.status === 'New' ? 'In Progress' : a.status,
            timeline: [
              ...a.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: now,
                title: `Police Unit ${unitCode} Assigned`,
                detail: `Dispatched ${unitCode} to clear corridor for ${a.ambulanceId}.`,
                actor: officerName,
              },
            ],
          };
        })
      );

      setPoliceUnits((prev) =>
        prev.map((u) =>
          u.unitCode === unitCode
            ? { ...u, status: 'Clearing Route', assignedIncidentId: targetIncident }
            : u
        )
      );

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: `Police Unit ${unitCode} Assigned`,
          description: `Assigned ${unitCode} to escort ${targetIncident}.`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          incidentId: targetIncident,
          unitsNotified: [unitCode],
        },
        ...prev,
      ]);

      pushNotification({
        category: 'Police Unit Assigned',
        title: `${unitCode} Assigned to ${targetIncident}`,
        message: `Escort unit ${unitCode} is clearing the emergency corridor.`,
        targetRoute: '/emergency-alerts',
        incidentId: targetIncident,
      });

      addToast({
        type: 'info',
        title: 'Police Unit Dispatched',
        description: `${unitCode} assigned to ${targetIncident}.`,
      });
    },
    [session, pushNotification, addToast]
  );

  const notifyNearbyUnits = useCallback(
    (alertId: string) => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';
      let targetIncident = '';

      setAlerts((prev) =>
        prev.map((a) => {
          if (a.id !== alertId) return a;
          targetIncident = a.incidentId;
          return {
            ...a,
            nearbyUnitsNotified: true,
            timeline: [
              ...a.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: now,
                title: 'Nearby Units Notified',
                detail: 'All patrol units within 2 km corridor alerted for traffic holding.',
                actor: officerName,
              },
            ],
          };
        })
      );

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: 'Alerts Sent to Nearby Units',
          description: `Broadcast clearance directive for ${targetIncident} to nearby field units.`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          incidentId: targetIncident,
          unitsNotified: ['BTP-UNIT-07', 'BTP-UNIT-12', 'BTP-UNIT-15'],
        },
        ...prev,
      ]);

      addToast({
        type: 'success',
        title: 'Nearby Units Alerted',
        description: `Patrol units along ${targetIncident} route have been notified.`,
      });
    },
    [session, addToast]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';
      let targetIncident = '';
      let targetAmb = '';

      setAlerts((prev) =>
        prev.map((a) => {
          if (a.id !== alertId) return a;
          targetIncident = a.incidentId;
          targetAmb = a.ambulanceId;
          return {
            ...a,
            status: 'Resolved',
            etaMinutes: 0,
            distanceKm: 0,
            timeline: [
              ...a.timeline,
              {
                id: `ev-${Date.now()}`,
                timestamp: now,
                title: 'Emergency Marked Resolved',
                detail: `Corridor closed and normal signal timing resumed by ${officerName}.`,
                actor: officerName,
              },
            ],
          };
        })
      );

      if (targetAmb) {
        setAmbulances((prev) =>
          prev.map((amb) =>
            amb.ambulanceId === targetAmb
              ? {
                  ...amb,
                  status: 'Completed',
                  etaMinutes: 0,
                  distanceRemainingKm: 0,
                  speedKmh: 0,
                  routeProgress: 1,
                  currentCoords: amb.hospitalCoords,
                  stages: amb.stages.map((s) => ({ ...s, completed: true, active: false })),
                }
              : amb
          )
        );
      }

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: `Incident ${targetIncident} Resolved`,
          description: `Emergency corridor deactivated after hospital handover.`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          incidentId: targetIncident,
        },
        ...prev,
      ]);

      addToast({
        type: 'success',
        title: 'Emergency Resolved',
        description: `${targetIncident} marked as resolved.`,
      });
    },
    [session, addToast]
  );

  const toggleSignalPriority = useCallback(
    (signalId: string, enable: boolean) => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';
      let locationName = '';

      setSignals((prev) =>
        prev.map((sig) => {
          if (sig.signalId !== signalId && sig.id !== signalId) return sig;
          locationName = sig.location;
          return {
            ...sig,
            mode: enable ? 'Emergency Priority' : 'Normal',
            currentLight: enable ? 'Green' : 'Green',
            countdownSeconds: enable ? 45 : 50,
            lastUpdate: now,
          };
        })
      );

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: enable
            ? `Priority Green Simulation: ${locationName}`
            : `Normal Timing Restored: ${locationName}`,
          description: enable
            ? `Simulated emergency green priority activated for ${locationName} (${signalId}).`
            : `Simulated normal signal phase restored at ${locationName} (${signalId}).`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          affectedSignals: [signalId],
        },
        ...prev,
      ]);

      pushNotification({
        category: 'Signal Update',
        title: `${locationName} (${signalId}) Updated`,
        message: enable
          ? 'Priority Green simulation activated for emergency route.'
          : 'Signal returned to standard cycle timing.',
        targetRoute: '/traffic-control',
      });

      addToast({
        type: enable ? 'success' : 'info',
        title: enable ? 'Priority Green Simulation Active' : 'Normal Cycle Restored',
        description: `${locationName} (${signalId}) — Simulated control only.`,
      });
    },
    [session, pushNotification, addToast]
  );

  const switchSignalLight = useCallback(
    (signalId: string, light: SignalLight) => {
      const now = formatIstTime();
      let loc = '';
      setSignals((prev) =>
        prev.map((sig) => {
          if (sig.signalId !== signalId && sig.id !== signalId) return sig;
          loc = sig.location;
          return {
            ...sig,
            currentLight: light,
            mode: 'Manual Override',
            countdownSeconds: light === 'Yellow' ? 5 : 40,
            lastUpdate: now,
          };
        })
      );
      addToast({
        type: 'info',
        title: `Signal Phase Changed (${loc})`,
        description: `Simulated state switched to ${light}.`,
      });
    },
    [addToast]
  );

  const executeClearEmergencyRoute = useCallback(
    (incidentId = 'SRT-20261125-0427') => {
      const now = formatIstTime();
      const officerName = session?.officer.name || 'Duty Officer';

      // Set MG Road, Brigade Road, Trinity Circle signals to simulated priority
      setSignals((prev) =>
        prev.map((sig) =>
          ['SIG-MG-01', 'SIG-TC-03'].includes(sig.signalId)
            ? {
                ...sig,
                mode: 'Emergency Priority',
                currentLight: 'Green',
                countdownSeconds: 45,
                lastUpdate: now,
              }
            : sig
        )
      );

      setPoliceActions((prev) => [
        {
          id: `act-${Date.now()}`,
          title: 'Emergency Route Cleared (Simulated)',
          description: `Simulated corridor clearance executed for ${incidentId}: MG Road → Trinity Circle → VVIT Hospital.`,
          status: 'Completed',
          timestamp: now,
          officer: officerName,
          incidentId,
          affectedSignals: ['SIG-MG-01', 'SIG-BR-02', 'SIG-TC-03'],
          unitsNotified: ['BTP-UNIT-07', 'BTP-UNIT-12'],
        },
        ...prev.map((item) =>
          item.status === 'Pending' ? { ...item, status: 'Completed' as const } : item
        ),
      ]);

      pushNotification({
        category: 'Route Cleared',
        title: `Corridor Cleared for ${incidentId}`,
        message: 'MG Road & Trinity Circle simulated priority green active; nearby units notified.',
        targetRoute: '/dashboard',
        incidentId,
      });

      addToast({
        type: 'success',
        title: 'Emergency Route Cleared',
        description: `Corridor optimized for ${incidentId} (Demo Simulation).`,
      });
    },
    [session, pushNotification, addToast]
  );

  const advanceAmbulanceSimulation = useCallback(
    (ambulanceId: string) => {
      const now = formatIstTime();
      setAmbulances((prev) =>
        prev.map((amb) => {
          if (amb.ambulanceId !== ambulanceId && amb.id !== ambulanceId) return amb;
          const nextProgress = Math.min(1, amb.routeProgress + 0.25);
          const nextCoords = interpolateRoutePosition(amb.routeWaypoints, nextProgress);
          const remaining = Math.max(0, 1 - nextProgress);
          const derived = deriveStagesForProgress(nextProgress, amb.stages);
          return {
            ...amb,
            routeProgress: nextProgress,
            currentCoords: nextCoords,
            distanceRemainingKm: Number((remaining * 2.2).toFixed(1)),
            etaMinutes: nextProgress >= 0.99 ? 0 : Math.max(1, Math.round(remaining * 4)),
            status: derived.status,
            stages: derived.stages,
            lastUpdated: now,
          };
        })
      );
      addToast({
        type: 'info',
        title: `Ambulance ${ambulanceId} Updated`,
        description: 'Simulated route progress advanced.',
      });
    },
    [addToast]
  );

  const refreshOperationalData = useCallback(() => {
    const now = formatIstTime();
    setTrafficSeries((prev) =>
      prev.map((pt, idx) =>
        idx === prev.length - 1
          ? {
              ...pt,
              speedKmh: Math.max(24, Math.min(40, pt.speedKmh + (Math.random() > 0.5 ? 1 : -1))),
            }
          : pt
      )
    );
    setAmbulances((prev) => prev.map((a) => ({ ...a, lastUpdated: now })));
    addToast({
      type: 'info',
      title: 'Telemetry Refreshed',
      description: `Demo operational state synced at ${now} IST.`,
    });
  }, [addToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateSettings = useCallback(
    (updates: Partial<DashboardSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      addToast({
        type: 'success',
        title: 'Settings Saved',
        description: 'Dashboard preferences updated.',
      });
    },
    [addToast]
  );

  const primaryAlert = useMemo(
    () => alerts.find((a) => a.incidentId === 'SRT-20261125-0427') || alerts[0],
    [alerts]
  );

  const primaryAmbulance = useMemo(
    () =>
      ambulances.find((a) => a.ambulanceId === selectedAmbulanceId) ||
      ambulances.find((a) => a.ambulanceId === 'SRT-1047') ||
      ambulances[0],
    [ambulances, selectedAmbulanceId]
  );

  const activeSignalsCount = useMemo(
    () => signals.filter((s) => s.status === 'Active').length,
    [signals]
  );
  const totalSignalsCount = signals.length * 5 + 2; // Represents 48 / 52 scale or dynamic offset
  const offlineSignalsCount = useMemo(
    () => signals.filter((s) => s.status !== 'Active').length + 2,
    [signals]
  );

  const activeEmergenciesCount = useMemo(() => {
    const criticalOpen = alerts.filter(
      (a) => a.priority === 'Critical' && a.status !== 'Resolved'
    ).length;
    return criticalOpen > 0 ? criticalOpen : alerts.filter((a) => a.status !== 'Resolved').length;
  }, [alerts]);

  const avgTrafficSpeedKmh = trafficSeries[trafficSeries.length - 1]?.speedKmh ?? 32;
  const avgDelayMin = trafficSeries[trafficSeries.length - 1]?.delayMin ?? 2.8;
  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo<SertosContextValue>(
    () => ({
      appMode: ENV_CONFIG.appMode,
      session,
      isAuthenticated: Boolean(session),
      logoutNotice,
      clearLogoutNotice,
      login,
      logout,
      updateOfficerProfile,
      alerts,
      ambulances,
      signals,
      policeUnits,
      roadCorridors,
      policeActions,
      cameras,
      trafficSeries,
      notifications,
      settings,
      primaryAlert,
      primaryAmbulance,
      selectedAmbulanceId,
      setSelectedAmbulanceId,
      activeSignalsCount: 48 - (signals.filter((s) => s.status !== 'Active').length - 2),
      totalSignalsCount,
      offlineSignalsCount,
      activeEmergenciesCount,
      avgTrafficSpeedKmh,
      avgDelayMin,
      unreadNotificationsCount,
      acknowledgeAlert,
      assignPoliceUnit,
      notifyNearbyUnits,
      resolveAlert,
      toggleSignalPriority,
      switchSignalLight,
      executeClearEmergencyRoute,
      advanceAmbulanceSimulation,
      refreshOperationalData,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      updateSettings,
      toasts,
      addToast,
      dismissToast,
    }),
    [
      session,
      logoutNotice,
      clearLogoutNotice,
      login,
      logout,
      updateOfficerProfile,
      alerts,
      ambulances,
      signals,
      policeUnits,
      roadCorridors,
      policeActions,
      cameras,
      trafficSeries,
      notifications,
      settings,
      primaryAlert,
      primaryAmbulance,
      selectedAmbulanceId,
      totalSignalsCount,
      offlineSignalsCount,
      activeEmergenciesCount,
      avgTrafficSpeedKmh,
      avgDelayMin,
      unreadNotificationsCount,
      acknowledgeAlert,
      assignPoliceUnit,
      notifyNearbyUnits,
      resolveAlert,
      toggleSignalPriority,
      switchSignalLight,
      executeClearEmergencyRoute,
      advanceAmbulanceSimulation,
      refreshOperationalData,
      markNotificationRead,
      markAllNotificationsRead,
      clearNotifications,
      updateSettings,
      toasts,
      addToast,
      dismissToast,
    ]
  );

  return <SertosContext.Provider value={value}>{children}</SertosContext.Provider>;
};

export function useSertos(): SertosContextValue {
  const ctx = useContext(SertosContext);
  if (!ctx) {
    throw new Error('useSertos must be used inside SertosProvider');
  }
  return ctx;
}
