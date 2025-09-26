/**
 * Session timeout service for Box token management
 */

import { clearAuthCookies, getCookie } from './cookies';

interface SessionTimeoutOptions {
  onShowPopup?: () => void;
  onHidePopup?: () => void;
  onLogout?: () => void;
  onExtendSession?: () => void;
}

class SessionTimeoutService {
  private intervalId: NodeJS.Timeout | null = null;
  private popupTimeoutId: NodeJS.Timeout | null = null;
  private options: SessionTimeoutOptions;

  constructor(options: SessionTimeoutOptions = {}) {
    this.options = options;
  }

  /**
   * Start the session timeout service
   * Shows popup 1 minute before hourly timeout
   */
  start() {
    if (this.intervalId) {
      console.warn('Session timeout service is already running');
      return;
    }

    console.log('Starting session timeout service - will show popup every 59 minutes');
    
    // Set up hourly popup (59 minutes = 3540000ms)
    this.intervalId = setInterval(() => {
      this.showTimeoutPopup();
    }, 3540000); // 59 minutes = 3540000ms
  }

  /**
   * Stop the session timeout service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.popupTimeoutId) {
      clearTimeout(this.popupTimeoutId);
      this.popupTimeoutId = null;
    }
    console.log('Session timeout service stopped');
  }

  /**
   * Show the timeout popup
   */
  showTimeoutPopup() {
    console.log('Showing session timeout popup');
    
    // Call show popup callback
    if (this.options.onShowPopup) {
      this.options.onShowPopup();
    }

    // Set timeout for 1 minute (60 seconds)
    this.popupTimeoutId = setTimeout(() => {
      console.log('Session timeout - no response from user');
      this.handleTimeout();
    }, 60000); // 60 seconds = 60000ms
  }

  /**
   * Handle user clicking "Yes" - extend session
   */
  extendSession() {
    console.log('User extended session');
    
    // Clear the popup timeout
    if (this.popupTimeoutId) {
      clearTimeout(this.popupTimeoutId);
      this.popupTimeoutId = null;
    }

    // Call extend session callback
    if (this.options.onExtendSession) {
      this.options.onExtendSession();
    }

    // Call hide popup callback
    if (this.options.onHidePopup) {
      this.options.onHidePopup();
    }
  }

  /**
   * Handle user clicking "No" - logout
   */
  handleNo() {
    console.log('User chose to logout');
    
    // Clear the popup timeout
    if (this.popupTimeoutId) {
      clearTimeout(this.popupTimeoutId);
      this.popupTimeoutId = null;
    }

    // Call hide popup callback
    if (this.options.onHidePopup) {
      this.options.onHidePopup();
    }

    // Handle logout
    this.handleLogout();
  }

  /**
   * Handle timeout - user didn't respond in time
   */
  handleTimeout() {
    console.log('Session timeout - logging out user');
    
    // Call hide popup callback
    if (this.options.onHidePopup) {
      this.options.onHidePopup();
    }

    // Handle logout
    this.handleLogout();
  }

  /**
   * Handle logout when token refresh fails
   */
  private handleLogout() {
    console.log('Timeout, logging out user...');
    
    // Clear all authentication cookies
    clearAuthCookies();

    // Get logout URL from cookies
    const logoutURL = getCookie('redirect_to_box_url');
    
    if (logoutURL) {
      // Call logout callback if provided
      if (this.options.onLogout) {
        this.options.onLogout();
      }
      
      // Redirect to Box logout URL
      window.location.href = logoutURL;
    } else {
      // Fallback: close the tab
      window.close();
    }
  }

  /**
   * Check if the service is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Create a singleton instance
let sessionTimeoutService: SessionTimeoutService | null = null;

/**
 * Get the singleton session timeout service instance
 */
export function getSessionTimeoutService(options?: SessionTimeoutOptions): SessionTimeoutService {
  if (!sessionTimeoutService) {
    sessionTimeoutService = new SessionTimeoutService(options);
  }
  return sessionTimeoutService;
}

/**
 * Start the session timeout service with default options
 */
export function startSessionTimeout(options?: SessionTimeoutOptions) {
  const service = getSessionTimeoutService(options);
  service.start();
  return service;
}

/**
 * Stop the session timeout service
 */
export function stopSessionTimeout() {
  if (sessionTimeoutService) {
    sessionTimeoutService.stop();
  }
}

/**
 * Handle user response to timeout popup
 */
export function handleSessionResponse(response: 'yes' | 'no') {
  if (sessionTimeoutService) {
    if (response === 'yes') {
      sessionTimeoutService.extendSession();
    } else {
      sessionTimeoutService.handleNo();
    }
  }
}

export default SessionTimeoutService;
