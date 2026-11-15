import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TelemetryProvider } from './contexts/TelemetryContext';
import { DemoScenarioProvider } from './contexts/DemoScenarioContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StationsPage } from './pages/StationsPage';
import { StationDetailPage } from './pages/StationDetailPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { EquipmentDetailPage } from './pages/EquipmentDetailPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { EnergyPage } from './pages/EnergyPage';
import { InventoryPage } from './pages/InventoryPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { WeatherPage } from './pages/WeatherPage';
import { AlertsPage } from './pages/AlertsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { CommunicationPage } from './pages/CommunicationPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedStationId, setSelectedStationId] = useState('bharati');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('EQ-BH-GEN-01');

  if (!user || currentPage === 'login') {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'stations':
        return (
          <StationsPage
            onNavigate={setCurrentPage}
            onSelectStationDetail={(id) => {
              setSelectedStationId(id);
              setCurrentPage('station-detail');
            }}
          />
        );
      case 'station-detail':
        return (
          <StationDetailPage
            stationId={selectedStationId}
            onBack={() => setCurrentPage('stations')}
            onNavigate={setCurrentPage}
          />
        );
      case 'live-monitoring':
        return <LiveMonitoringPage />;
      case 'equipment':
        return (
          <EquipmentPage
            onSelectEquipment={(id) => {
              setSelectedEquipmentId(id);
              setCurrentPage('equipment-detail');
            }}
          />
        );
      case 'equipment-detail':
        return (
          <EquipmentDetailPage
            equipmentId={selectedEquipmentId}
            onBack={() => setCurrentPage('equipment')}
          />
        );
      case 'predictive-maintenance':
        return <PredictiveMaintenancePage />;
      case 'energy':
        return <EnergyPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'personnel':
        return <PersonnelPage />;
      case 'weather':
        return <WeatherPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'incidents':
        return <IncidentsPage />;
      case 'communication':
        return <CommunicationPage />;
      case 'digital-twin':
        return <DigitalTwinPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'ai-insights':
        return <AIInsightsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <MainLayout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TelemetryProvider>
        <DemoScenarioProvider>
          <AppContent />
        </DemoScenarioProvider>
      </TelemetryProvider>
    </AuthProvider>
  );
}
