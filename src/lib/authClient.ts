import { createAuthClient } from 'better-auth/react';
import { nextCookies } from 'better-auth/next-js';
// import { jwtClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [nextCookies()],
});
