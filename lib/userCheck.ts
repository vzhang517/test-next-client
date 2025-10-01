import { User } from '@/types/auth';

/**
 * Check if a user ID is in the admin list
 */
export function isAdminUser(userId: string): boolean {
   //const adminUserIds = process.env.ADMIN_USER_IDS?.replace(/['"]/g, '').split(',').map(id => id.trim()) || [];
  const adminUserIds = process.env.ADMIN_USER_IDS;
  console.log('adminUserIds', adminUserIds);
  console.log('userId', userId);
  return false
}

/**
 * Generate a display name from user ID
 */
function generateUserName(userId: string): string {
  // Convert user ID to a more readable format
  // This could be enhanced to fetch from an API or use a mapping
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '');
  return `User ${cleanId.substring(0, 8)}`;
}

/**
 * Authenticate user with Box.com userID from URL
 */
export function checkAdmin(userId: string, userName: string): User {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return {
    id: userId,
    name: userName,
    isAdmin: isAdminUser(userId),
  };
}

/**
 * Extract user ID from URL parameters
 */
export function extractUserIdFromUrl(searchParams: URLSearchParams): string | null {
  return searchParams.get('userID') || searchParams.get('userId') || searchParams.get('user_id');
}

