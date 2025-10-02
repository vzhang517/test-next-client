'use client';

import { User } from '@/types/auth';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange?: (section: string) => void;
  user?: User | null;
}

export default function MainLayout({ children, currentSection, onSectionChange, user }: LayoutProps) {
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        isAdmin={user.isAdmin} 
        currentSection={currentSection} 
        userName={user.name}
        onSectionChange={onSectionChange}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

