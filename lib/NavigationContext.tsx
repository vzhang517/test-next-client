'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  selectedContainerId: string | null;
  setSelectedContainerId: (containerId: string | null) => void;
  navigateToRecertification: (containerId: string) => void;
  navigateToRecertificationHistory: (containerId: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  onSectionChange?: (section: string) => void;
}

export function NavigationProvider({ children, onSectionChange }: NavigationProviderProps) {
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

  const navigateToRecertification = (containerId: string) => {
    setSelectedContainerId(containerId);
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
        setSelectedContainerId, 
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
