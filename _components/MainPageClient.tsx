'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { startSessionTimeout, stopSessionTimeout, handleSessionResponse } from '@/lib/refresh';
import Layout from '@/_components/Layout';
import AdminView from '@/_components/AdminView';
import Recertification from '@/_components/Recertification';
import ContainerRecertificationDetails from '@/_components/ContainerRecertificationDetails';
import ContainerOwnerDashboard from '@/_components/ContainerOwnerDashboard';
import SessionTimeoutPopup from '@/_components/SessionTimeoutPopup';

interface MainPageClientProps {
  user: User;
  initialSection?: string;
}

export default function MainPageClient({ user, initialSection = 'recertification' }: MainPageClientProps) {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);

  useEffect(() => {
    // Start session timeout service
    startSessionTimeout({
      onShowPopup: () => {
        console.log('Showing session timeout popup');
        setShowTimeoutPopup(true);
        setTimeoutCountdown(60); // Reset countdown to 60 seconds
      },
      onHidePopup: () => {
        console.log('Hiding session timeout popup');
        setShowTimeoutPopup(false);
      },
      onLogout: () => {
        console.log('Logging out due to session timeout');
        // Handle logout - could redirect or show error
      },
      onExtendSession: () => {
        console.log('Session extended by user');
        // Session is extended, popup will be hidden automatically
      }
    });

    // Cleanup: stop session timeout when component unmounts
    return () => {
      stopSessionTimeout();
    };
  }, []);

  // Handle popup responses
  const handlePopupYes = () => {
    handleSessionResponse('yes');
  };

  const handlePopupNo = () => {
    handleSessionResponse('no');
  };

  const handlePopupTimeout = () => {
    handleSessionResponse('no'); // Treat timeout same as "No"
  };

  const renderContent = () => {
    if (!user) return null;

    switch (currentSection) {
      case 'admin':
        if (!user.isAdmin) {
          return (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">Admin privileges required to access this section.</p>
            </div>
          );
        }
        return <AdminView userId={user.id} />;
      
      case 'recertification':
        return <Recertification userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-details':
        return <ContainerRecertificationDetails userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-owner-dashboard':
        return <ContainerOwnerDashboard userId={user.id} isAdmin={user.isAdmin} />;
      
      default:
        return <Recertification userId={user.id} isAdmin={user.isAdmin} />;
    }
  };

  return (
    <>
      <Layout 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        user={user}
      >
        {renderContent()}
      </Layout>
      
      {/* Session Timeout Popup */}
      <SessionTimeoutPopup
        isOpen={showTimeoutPopup}
        onYes={handlePopupYes}
        onNo={handlePopupNo}
        onTimeout={handlePopupTimeout}
        timeRemaining={timeoutCountdown}
      />
    </>
  );
}
