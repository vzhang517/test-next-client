'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  selectedContainerId: string | null;
  selectedRecertificationId: string | null;
  setSelectedContainerId: (containerId: string | null) => void;
  setSelectedRecertificationId: (recertificationId: string | null) => void;
  navigateToRecertification: (containerId: string, recertificationId: string) => void;
  navigateToRecertificationHistory: (containerId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  onSectionChange?: (section: string) => void;
}

export function NavigationProvider({ children, onSectionChange }: NavigationProviderProps) {
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [selectedRecertificationId, setSelectedRecertificationId] = useState<string | null>(null);

  const navigateToRecertification = (containerId: string, recertificationId: string) => {
    setSelectedContainerId(containerId);
    setSelectedRecertificationId(recertificationId);
    onSectionChange?.('container-recertification');
  };

  const navigateToRecertificationHistory = (containerId: string) => {
    setSelectedContainerId(containerId);
    onSectionChange?.('container-recertification-history');
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        selectedContainerId, 
        selectedRecertificationId,
        setSelectedContainerId, 
        setSelectedRecertificationId,
        navigateToRecertification,
        navigateToRecertificationHistory
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
