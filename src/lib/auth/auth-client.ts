import { adminClient, multiSessionClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { AdminRole, ac, OwnerRole, UserRole } from './permission';

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    multiSessionClient(),
    adminClient({
      ac,
      roles: {
        admin: AdminRole,
        owner: OwnerRole,
        user: UserRole,
      },
    }),
  ],
});
