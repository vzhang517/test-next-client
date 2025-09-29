'use client';

import { User } from '@/types/auth';
import { checkAdmin } from '@/lib/userCheck';
import MainPageClient from '@/_components/MainPageClient';
import AppError from '@/_components/Error';
import AuthenticatedLoading from '../../../_components/AuthenticatedLoading';
import { getUserCookies } from '@/src/app/cookies'
import { useState, useEffect, Suspense } from 'react';

export default function MainPageContent() {
  return (
    <div>
      test
    </div>
  )
}