import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RecruiterNavbar } from './RecruiterNavbar';

export const RecruiterLayout: React.FC = () => {
  const location = useLocation();
  const [fade, setFade] = useState(true);

  // Trigger 150ms content fade transition on route change
  useEffect(() => {
    setFade(false);
    const timer = setTimeout(() => setFade(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--gray-bg)', display: 'flex', flexDirection: 'column' }}>
      <RecruiterNavbar />
      
      <main 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          opacity: fade ? 1 : 0.6,
          transition: 'opacity 0.15s ease-in-out'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};
