'use client';

import { useState } from 'react';

interface NavbarProps {
  isAdmin: boolean;
  currentSection: string;
  userName: string;
  onSectionChange?: (section: string) => void;
}

export default function Navbar({ isAdmin, currentSection, userName, onSectionChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const adminNavItems = [
    { key: 'container-owner-dashboard', label: 'Container Owner Dashboard' },
    { key: 'container-recertification-history', label: 'Container Recertification History' },
    { key: 'container-recertification', label: 'Container Recertification' },
    { key: 'container-reassignment', label: 'Container Reassignment' },
    { key: 'email-templates', label: 'Email Templates' },
    { key: 'search', label: 'Search' },
    
  ];

  const userNavItems = [
    { key: 'container-owner-dashboard', label: 'Container Owner Dashboard' },
    { key: 'container-recertification-history', label: 'Container Recertification History' },
    { key: 'container-recertification', label: 'Container Recertification' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {/* Top Header with Logo */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/state-street-logo.png" 
                  alt="State Street Logo" 
                  className="h-8 mr-3"
                />
                <h1 className="text-xl font-bold">Container Recertificiation</h1>
              </div>
            </div>

            {/* User name and mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* User name - hidden on mobile */}
              <div className="hidden md:block">
                <span className="text-blue-100 text-sm font-bold">
                  {userName}
                </span>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <svg
                    className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Buttons Section */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 py-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onSectionChange?.(item.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentSection === item.key
                    ? 'bg-gray-300 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-3">
              {/* User name in mobile menu */}
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <span className="text-gray-600 text-sm font-bold">
                  {userName}
                </span>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onSectionChange?.(item.key);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      currentSection === item.key
                        ? 'bg-gray-300 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

