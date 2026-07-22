import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RecruiterNavbar } from './RecruiterNavbar';
import { RecruiterMobileGuard } from './RecruiterMobileGuard';

export const RecruiterLayout: React.FC = () => {
  const location = useLocation();
  const [fade, setFade] = useState(true);
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger 150ms content fade transition on route change
  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isMobileScreen) {
    return <RecruiterMobileGuard />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-bg)', display: 'flex', flexDirection: 'column' }}>
      <RecruiterNavbar />
      
      <main 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          opacity: fade ? 1 : 0.6,
          transition: 'opacity 0.15s ease-in-out',
          overflowY: 'auto'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};
