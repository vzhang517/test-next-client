'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainLayout from '@/_components/MainLayout';
import AdminView from '@/_components/AdminView';
import ContainerRecertification from '@/_components/ContainerRecertification';
import ContainerRecertificationDetails from '@/_components/ContainerRecertificationDetails';
import ContainerOwnerDashboard from '@/_components/ContainerOwnerDashboard';
export default function MainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState('recertification');

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        
        const userId = sessionStorage.getItem('userID');
        const userName = sessionStorage.getItem('userName');

          if (!userId || !userName) {
            setError('User ID or user name not found');
            setIsLoading(false);
            return;
          }

          const authenticatedUser = await checkAdmin(userId, userName);
          setUser(authenticatedUser);
          setError(null);
          if (authenticatedUser.isAdmin) {
            setCurrentSection('admin');
          } else {
            setCurrentSection('container-owner');
          }

          
        } catch (error) {
          console.error('Box authentication error:', error);
          setError(error instanceof Error ? error.message : 'Authentication failed');
          setIsLoading(false);
        }
      };
      
      getUserInfo()
      setIsLoading(false);
  }, []);


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
      
      case 'container-recertification':
        return <ContainerRecertification userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-recertification-details':
        return <ContainerRecertificationDetails userId={user.id} isAdmin={user.isAdmin} />;
      
      case 'container-owner':
        return <ContainerOwnerDashboard userId={user.id} isAdmin={user.isAdmin} />;
      
      default:
        return <ContainerOwnerDashboard userId={user.id} isAdmin={user.isAdmin} />;
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
      <MainLayout 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        user={user}
      >
        {renderContent()}
      </MainLayout>
      
    </>
  );
}