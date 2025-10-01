'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { checkAdmin, extractUserIdFromUrl } from '@/lib/userCheck';
import { startSessionTimeout, stopSessionTimeout, handleSessionResponse } from '@/lib/refresh';
import Layout from '@/_components/Layout';
import AdminView from '@/_components/AdminView';
import Recertification from '@/_components/Recertification';
import ContainerRecertificationDetails from '@/_components/ContainerRecertificationDetails';
import ContainerOwnerDashboard from '@/_components/ContainerOwnerDashboard';
import SessionTimeoutPopup from '@/_components/SessionTimeoutPopup';
import { getCookie } from 'cookies-next/client'

export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState('recertification');
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState(60);
  const userId = getCookie('user_id');
  const userName = getCookie('user_name');

  useEffect(() => {
    const getUserInfo = async () => {
      try {

        console.log('userID stored in localStorage front page:', localStorage.getItem('userID'));


          if (!userId || !userName) {
            setError('User ID or user name not found');
            setIsLoading(false);
            return;
          }

          const authenticatedUser = checkAdmin(userId, userName);
          setUser(authenticatedUser);
          setError(null);
          setCurrentSection('admin');

          
        } catch (error) {
          console.error('Box authentication error:', error);
          setError(error instanceof Error ? error.message : 'Authentication failed');
          setIsLoading(false);
        }
      };
      getUserInfo();

    try {
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
          setError('Session expired. Closing application...');
        },
        onExtendSession: () => {
          console.log('Session extended by user');
          // Session is extended, popup will be hidden automatically
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium text-gray-900">Authentication Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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