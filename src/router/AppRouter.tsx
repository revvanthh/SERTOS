import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useSertos } from '../context/SertosContext';
import { AppShell } from '../components/layout/AppShell';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { TrafficControl } from '../pages/TrafficControl';
import { EmergencyAlerts } from '../pages/EmergencyAlerts';
import { AmbulanceTracking } from '../pages/AmbulanceTracking';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useSertos();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const AppRouter: React.FC = () => {
  const { isAuthenticated } = useSertos();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/traffic-control" element={<TrafficControl />} />
            <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
            <Route path="/ambulance-tracking" element={<AmbulanceTracking />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};
