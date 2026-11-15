import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SimulatedBanner } from './SimulatedBanner';
import { DemoScenarioBar } from './DemoScenarioBar';

export const MainLayout = ({ activePage, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-polar-950 flex flex-col font-sans">
      <SimulatedBanner />
      <Navbar onNavigate={onNavigate} />
      <DemoScenarioBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-polar-950 to-polar-900/60">
          {children}
        </main>
      </div>
    </div>
  );
};
