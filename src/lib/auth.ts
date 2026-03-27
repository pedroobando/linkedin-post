import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { accounts, db, sessions, users, verifications } from '@/db';

// Configuración de autenticación con la instancia estática de la base de datos
export const auth = betterAuth({
  trustedOrigins: [...(process.env.BETTER_AUTH_TRUSTEDORG || '')],
  baseURL: process.env.BETTER_AUTH_URL as string,
  secret: process.env.BETTER_AUTH_SECRET as string,
  rateLimit: {
    enabled: true,
    // ... other rate limiting options
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false, // Only if you want to block login completely
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      users: users,
      sessions: sessions,
      accounts: accounts,
      verifications: verifications,
    },
    usePlural: true, // Optional: Use plural table names (e.g., "users" instead of "user")
    debugLogs: false, // Optional
  }),
  plugins: [nextCookies()],
  socialProviders: {},
  session: {
    expiresIn: 60 * 60 * 24 * 2, // 2 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        fieldName: 'role',
        input: true,
      },
    },
  },
});

// Exportar tipos directamente desde la instancia de autenticación
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
