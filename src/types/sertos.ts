export type AppMode = 'DEMO' | 'LIVE';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'New' | 'Acknowledged' | 'In Progress' | 'Resolved';

export type AmbulanceStatus =
  | 'Dispatched'
  | 'En Route'
  | 'Approaching Hospital'
  | 'Arrived'
  | 'Completed';

export type SignalLight = 'Red' | 'Yellow' | 'Green';
export type SignalMode = 'Normal' | 'Emergency Priority' | 'Manual Override';
export type SignalHealthStatus = 'Active' | 'Offline' | 'Maintenance';
export type TrafficDensityLevel = 'Smooth' | 'Moderate' | 'Heavy';

export interface OfficerProfile {
  officerId: string;
  name: string;
  email: string;
  role: string;
  division: string;
  assignedZone: string;
  accountStatus: 'Active' | 'On Duty';
  phone: string;
  badgeNumber: string;
}

export interface AuthSession {
  token: string;
  mode: AppMode;
  officer: OfficerProfile;
  loggedInAt: string;
  expiresAt: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  actor: string;
}

export interface EmergencyAlert {
  id: string;
  incidentId: string;
  type: string;
  condition: string;
  patientSummary: string;
  location: string;
  zone: string;
  hospital: string;
  hospitalCoords: [number, number];
  hospitalBedsAvailable: number;
  priority: AlertSeverity;
  ambulanceId: string;
  etaMinutes: number;
  distanceKm: number;
  timeReceived: string;
  timestampIso: string;
  status: AlertStatus;
  assignedPoliceUnit?: string;
  nearbyUnitsNotified: boolean;
  timeline: TimelineEvent[];
}

export interface RouteStage {
  label: 'Dispatched' | 'On Route' | 'Arriving Soon' | 'Hospital Arrived';
  time?: string;
  completed: boolean;
  active: boolean;
}

export interface AmbulanceUnit {
  id: string;
  ambulanceId: string;
  incidentId: string;
  driverName: string;
  paramedicUnit: string;
  status: AmbulanceStatus;
  speedKmh: number;
  etaMinutes: number;
  distanceRemainingKm: number;
  destinationHospital: string;
  hospitalCoords: [number, number];
  currentCoords: [number, number];
  routeWaypoints: [number, number][];
  routeProgress: number; // 0 to 1
  stages: RouteStage[];
  lastUpdated: string;
}

export interface TrafficSignal {
  id: string;
  signalId: string;
  location: string;
  junction: string;
  zone: string;
  coords: [number, number];
  currentLight: SignalLight;
  trafficDensity: TrafficDensityLevel;
  mode: SignalMode;
  status: SignalHealthStatus;
  countdownSeconds: number;
  cycleTiming: string;
  trafficVolumePerHour: number;
  affectedRoutes: string[];
  lastUpdate: string;
  lastMaintenance: string;
  hardwareConnected: boolean;
}

export interface PoliceUnit {
  id: string;
  unitCode: string;
  officerName: string;
  zone: string;
  coords: [number, number];
  status: 'Available' | 'Escorting' | 'Clearing Route' | 'On Patrol';
  assignedIncidentId?: string;
}

export interface RoadCorridor {
  id: string;
  name: string;
  density: TrafficDensityLevel;
  avgSpeedKmh: number;
  coords: [number, number][];
}

export interface PoliceActionItem {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'Pending';
  timestamp: string;
  officer: string;
  incidentId?: string;
  affectedSignals?: string[];
  unitsNotified?: string[];
}

export interface CctvCamera {
  id: string;
  cameraId: string;
  location: string;
  zone: string;
  imageUrl: string;
  status: 'Demo Stream' | 'Offline';
  resolution: string;
  fps: number;
}

export interface TrafficMetricPoint {
  time: string;
  speedKmh: number;
  densityIndex: number;
  delayMin: number;
}

export interface AppNotification {
  id: string;
  category:
    | 'New Emergency'
    | 'Ambulance Approaching'
    | 'Traffic Congestion'
    | 'Route Cleared'
    | 'Police Unit Assigned'
    | 'Signal Update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetRoute: string;
  incidentId?: string;
}

export interface DashboardSettings {
  defaultTrafficLayer: boolean;
  defaultRoutesLayer: boolean;
  defaultPoliceLayer: boolean;
  defaultIncidentsLayer: boolean;
  alertSound: boolean;
  defaultCctvId: string;
  refreshIntervalSec: 3 | 5 | 10 | 30;
  notifyEmergencyAlerts: boolean;
  notifyRouteCleared: boolean;
  notifyAmbulanceNearing: boolean;
  notifySignalChanges: boolean;
  notifyPoliceUpdates: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  mode: AppMode;
  device: string;
  status: 'Success' | 'Failed';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
