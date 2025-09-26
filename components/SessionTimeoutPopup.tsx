'use client';

import { useState, useEffect } from 'react';

interface SessionTimeoutPopupProps {
  isOpen: boolean;
  onYes: () => void;
  onNo: () => void;
  onTimeout: () => void;
  timeRemaining: number; // in seconds
}

export default function SessionTimeoutPopup({ 
  isOpen, 
  onYes, 
  onNo, 
  onTimeout, 
  timeRemaining 
}: SessionTimeoutPopupProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(timeRemaining);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeRemaining, onTimeout]);

  useEffect(() => {
    setCountdown(timeRemaining);
  }, [timeRemaining]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 rounded-full mb-4">
            <svg 
              className="w-8 h-8 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Session Timeout Warning
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-4">
            Your session will expire in:
          </p>

          {/* Countdown Timer */}
          <div className="text-3xl font-mono font-bold text-red-600 mb-6">
            {formatTime(countdown)}
          </div>

          {/* Question */}
          <p className="text-gray-700 mb-6">
            Are you still working?
          </p>

          {/* Buttons */}
          <div className="flex space-x-4 justify-center">
            <button
              onClick={onNo}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              No
            </button>
            <button
              onClick={onYes}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Yes
            </button>
          </div>

          {/* Warning text */}
          <p className="text-xs text-gray-500 mt-4">
            If you don&apos;t respond, you will be automatically logged out.
          </p>
        </div>
      </div>
    </div>
  );
}
