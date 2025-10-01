'use server';

import { User } from '@/types/auth';

/**
 * Check if a user ID is in the admin list
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  console.log('adminUserIds', adminUserIds);
  console.log('userId', userId);
  return adminUserIds.includes(userId.trim());
}

/**
 * Authenticate user with Box.com userID from URL
 */
export async function checkAdmin(userId: string, userName: string): Promise<User> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return {
    id: userId,
    name: userName,
    isAdmin: await isAdminUser(userId),
  }
};
