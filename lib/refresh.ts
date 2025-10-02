/**
 * Session timeout service for Box token management
 */

interface SessionTimeoutOptions {
  onShowPopup?: () => void;
  onHidePopup?: () => void;
  onLogout?: () => void;
  onExtendSession?: () => void;
  onSignout?: () => void;
  router?: any; // Next.js router instance
}

class SessionTimeoutService {
  private intervalId: NodeJS.Timeout | null = null;
  private popupTimeoutId: NodeJS.Timeout | null = null;
  private options: SessionTimeoutOptions;
  private readonly SESSION_DURATION = 300000; // 5 minutes in milliseconds
  private readonly SESSION_STORAGE_KEY = 'sessionStartTime';

  constructor(options: SessionTimeoutOptions = {}) {
    this.options = options;
  }

  /**
   * Start the session timeout service
   * Shows popup 1 minute before session timeout
   */
  start() {
    if (this.intervalId) {
      console.warn('Session timeout service is already running');
      return;
    }

    console.log('Starting session timeout service - will show popup 1 minute before timeout');
    
    // Initialize or get existing session start time
    this.initializeSession();
    
    // Check if session has already expired
    if (this.isSessionExpired()) {
      console.log('Session has already expired, triggering logout');
      this.handleLogout();
      return;
    }

    // Set up the timeout based on remaining time
    this.scheduleNextTimeout();
  }

  /**
   * Initialize session start time if not already set
   */
  private initializeSession() {
    const existingStartTime = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    if (!existingStartTime) {
      const startTime = Date.now();
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, startTime.toString());
      console.log('Session started at:', new Date(startTime).toISOString());
    } else {
      console.log('Existing session found, started at:', new Date(parseInt(existingStartTime)).toISOString());
    }
  }

  /**
   * Check if the current session has expired
   */
  private isSessionExpired(): boolean {
    const startTime = parseInt(sessionStorage.getItem(this.SESSION_STORAGE_KEY) || '0');
    const elapsed = Date.now() - startTime;
    return elapsed >= this.SESSION_DURATION;
  }

  /**
   * Get remaining session time in milliseconds
   */
  private getRemainingTime(): number {
    const startTime = parseInt(sessionStorage.getItem(this.SESSION_STORAGE_KEY) || '0');
    const elapsed = Date.now() - startTime;
    return Math.max(0, this.SESSION_DURATION - elapsed);
  }

  /**
   * Schedule the next timeout based on remaining session time
   */
  private scheduleNextTimeout() {
    const remainingTime = this.getRemainingTime();
    const popupTime = remainingTime - 60000; // Show popup 1 minute before expiry

    if (popupTime <= 0) {
      // Less than 1 minute remaining, show popup immediately
      this.showTimeoutPopup();
    } else {
      // Schedule popup for the appropriate time
      console.log(`Scheduling popup in ${Math.round(popupTime / 1000)} seconds`);
      this.intervalId = setTimeout(() => {
        this.showTimeoutPopup();
      }, popupTime);
    }
  }

  /**
   * Reset the session start time (called when extending session)
   */
  private resetSession() {
    const startTime = Date.now();
    sessionStorage.setItem(this.SESSION_STORAGE_KEY, startTime.toString());
    console.log('Session reset at:', new Date(startTime).toISOString());
  }

  /**
   * Stop the session timeout service
   */
  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
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

    // Clear the main timeout
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    // Reset the session start time
    this.resetSession();

    // Call extend session callback
    if (this.options.onExtendSession) {
      this.options.onExtendSession();
    }

    // Call hide popup callback
    if (this.options.onHidePopup) {
      this.options.onHidePopup();
    }

    // Schedule the next timeout
    this.scheduleNextTimeout();
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
  private async handleLogout() {
    
    console.log('Timeout, logging out user...');
    
    // Clear all authentication data
    sessionStorage.removeItem('auth_code');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);

    // Call logout callback if provided
    if (this.options.onLogout) {
      this.options.onLogout();
    }

    // Redirect to signout page using Next.js router
    if (this.options.router) {
      this.options.router.push('/signout');
    } else {
      // Fallback to window.location if router not available
      window.location.replace('/signout');
    }
  }

  /**
   * Check if the service is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Get current session status for debugging
   */
  getSessionStatus() {
    const startTime = parseInt(sessionStorage.getItem(this.SESSION_STORAGE_KEY) || '0');
    const elapsed = Date.now() - startTime;
    const remaining = this.getRemainingTime();
    
    return {
      startTime: new Date(startTime).toISOString(),
      elapsed: Math.round(elapsed / 1000),
      remaining: Math.round(remaining / 1000),
      isExpired: this.isSessionExpired(),
      isRunning: this.isRunning()
    };
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

/**
 * Check if a session exists in storage
 */
export function hasActiveSession(): boolean {
  const startTime = sessionStorage.getItem('sessionStartTime');
  if (!startTime) return false;
  
  const elapsed = Date.now() - parseInt(startTime);
  return elapsed < 300000; // 5 minutes
}

/**
 * Get current session status
 */
export function getCurrentSessionStatus() {
  if (sessionTimeoutService) {
    return sessionTimeoutService.getSessionStatus();
  }
  return null;
}

export default SessionTimeoutService;
