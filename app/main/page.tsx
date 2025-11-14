'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { NavigationProvider } from '@/lib/NavigationContext';
import MainLayout from '@/_components/MainLayout';
import ContainerRecertification from '@/_components/ContainerRecertification';
import ContainerRecertificationHistory from '@/_components/ContainerRecertificationHistory';
import ContainerOwnerDashboard from '@/_components/ContainerOwnerDashboard';
import ContainerReassignment from '@/_components/ContainerReassignment';
import EmailTemplates from '@/_components/EmailTemplates';
import Support from '@/_components/Support';
import Search from '@/_components/Search';
export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState('recertification');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    
    const getUserInfo = async () => {
      try {
        // Only access sessionStorage on the client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const userId = sessionStorage.getItem('userID');
        const userName = sessionStorage.getItem('userName');

        console.log('userId in main page:', userId);
        console.log('userName in main page:', userName);

        if (!userId || !userName) {
          setError('User ID or user name not found');
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams({
          userId: userId
        });
  
        const response = await fetch(`/api/admin-check?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Admin check failed. status: ${response.status}`);
        }

        const data = await response.json();
        const isAdmin = data.is_admin || false;
        console.log('isAdmin:', isAdmin);
        const authenticatedUser: User = { id: userId, name: userName, isAdmin: isAdmin };
        setUser(authenticatedUser);
        setError(null);
        setCurrentSection('container-owner');
        setIsLoading(false);
      } catch (error) {
        console.error('Box authentication error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
      }
    };
      
    getUserInfo();
  }, []);


  const renderContent = () => {
    if (!user) return null;

    switch (currentSection) {
      
      case 'container-reassignment':
        if (!user.isAdmin) {
          return (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">Admin privileges required to access this section.</p>
            </div>
          );
        }
        return <ContainerReassignment userId={user.id} isAdmin={user.isAdmin}/>;

      case 'email-templates':
        if (!user.isAdmin) {
          return (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">Admin privileges required to access this section.</p>
            </div>
          );
        }
        return <EmailTemplates userId={user.id} isAdmin={user.isAdmin} />;

      case 'search':
        if (!user.isAdmin) {
          return (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
              <p className="text-gray-600">Admin privileges required to access this section.</p>
            </div>
          );
        }
        return <Search userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-recertification':
        return <ContainerRecertification userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-recertification-history':
        return <ContainerRecertificationHistory userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-owner':
        return <ContainerOwnerDashboard userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'support':
        return <Support />;
      
      default:
        return <ContainerOwnerDashboard userId={user.id} isAdmin={user.isAdmin} />;
    }
  };

  // Don't render anything until we're on the client side
  if (!isClient || isLoading) {
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
    <NavigationProvider onSectionChange={setCurrentSection}>
      <MainLayout 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        user={user}
      >
        {renderContent()}
      </MainLayout>
    </NavigationProvider>
  );
}