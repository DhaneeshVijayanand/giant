import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { IndustrySelectionPage } from './pages/IndustrySelectionPage';
import { DashboardPage } from './pages/DashboardPage';
import { PowerBIPage } from './pages/PowerBIPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page 1: Welcome Screen */}
        <Route path="/" element={<WelcomePage />} />

        {/* Page 2: Industry Selection */}
        <Route path="/industries" element={<IndustrySelectionPage />} />

        {/* Page 3: Industry Intelligence Dashboard */}
        <Route path="/industry/:slug" element={<DashboardPage />} />

        {/* Page 3.1: Live News Intelligence, Power BI */}
        <Route path="/industry/:slug/news-bi" element={<PowerBIPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
