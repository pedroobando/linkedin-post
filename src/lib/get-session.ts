'use server';
// 'use cache';
// import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { auth } from './auth';

export const getServerSession = cache(async () => {
  // console.log('getServerSession.');
  // const auth = await initAuth();
  return await auth.api.getSession({ headers: await headers() });
});
