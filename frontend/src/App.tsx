import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { GradientMeshBackground } from './components/GradientMeshBackground';
import { WelcomePage } from './pages/WelcomePage';
import { IndustrySelectionPage } from './pages/IndustrySelectionPage';
import { DashboardPage } from './pages/DashboardPage';
import { PowerBIPage } from './pages/PowerBIPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        <GradientMeshBackground />
        <div className="relative z-10">
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
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
