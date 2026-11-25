import { AppMode, OfficerProfile } from '../types/sertos';

const rawApiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export const ENV_CONFIG = {
  apiBaseUrl: rawApiBase,
  isDemoMode: !rawApiBase,
  appMode: (!rawApiBase ? 'DEMO' : 'LIVE') as AppMode,
  timezone: 'Asia/Kolkata',
  demoCredentials: {
    officerId: (import.meta.env.VITE_DEMO_OFFICER_ID as string | undefined) || 'BTP-4021',
    email: (import.meta.env.VITE_DEMO_OFFICER_EMAIL as string | undefined) || 'inspector.kumar@btp.gov.in',
    passcode: (import.meta.env.VITE_DEMO_OFFICER_PASSCODE as string | undefined) || 'SertosDemo@2026',
  },
  defaultDemoOfficer: {
    officerId: 'BTP-4021',
    name: 'Inspector Rajesh Kumar',
    email: 'inspector.kumar@btp.gov.in',
    role: 'Traffic Inspector',
    division: 'Bengaluru Central Traffic Division',
    assignedZone: 'MG Road · Trinity · Indiranagar Corridor',
    accountStatus: 'On Duty',
    phone: '+91 80 2294 3100',
    badgeNumber: 'KAR-BTP-4021',
  } satisfies OfficerProfile,
};
