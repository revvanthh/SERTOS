# SERTOS — Traffic Police Emergency Control

**SERTOS** stands for **Smart Emergency Response & Traffic Optimization System**. It is a Bengaluru Traffic Police dashboard concept for coordinating ambulance movements and emergency traffic response.

## Overview

SERTOS brings emergency alerts, ambulance tracking, route monitoring, traffic control, and response coordination into one operations dashboard. Its map is intended to show ambulances, hospitals, and emergency routes.

Demo data and simulated controls should be clearly identified. Traffic signal actions must remain simulations unless a verified backend integration supports real control.

## Project scope

The project brief describes these areas:

- Officer login, logout, and protected dashboard access
- Emergency overview and alerts
- Ambulance tracking and route monitoring
- Map views with ambulance and hospital markers
- Traffic control and route clearance simulations
- Analytics, reports, and CSV export
- Officer preferences and settings
- Responsive layouts for desktop and mobile

## Technology

The brief specifies a React, TypeScript, and Vite frontend, with React Router for navigation. It names Leaflet and OpenStreetMap for maps, and Lucide React for icons.

The existing SERTOS backend is described in the brief as Django with Django REST Framework. Authentication and API connections should use the backend’s existing endpoints where available.

## Getting started

From the project root, if the repository contains the corresponding npm scripts:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

Check `package.json` for the exact scripts and requirements in this repository.

## Backend and demo mode

When backend services are connected, the dashboard should use their data and handle API errors clearly. If an integration is unavailable, use an explicitly labeled demo mode with sample data and simulated activity.

Do not present simulated information as live emergency data or claim that the app controls physical traffic signals unless that capability is verified.

## Configuration

Set API and map configuration using the environment variables supported by the project. Keep credentials and secret keys out of source control, and do not commit `.env` files.

## Project status

This README draft reflects the supplied project brief. Confirm the actual features, integrations, environment variables, and run commands against the project source before publishing it.
