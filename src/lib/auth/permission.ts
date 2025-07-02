import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
  project: ['create', 'update', 'delete'],
} as const;

export const ac = createAccessControl(statement);

// Define role strings that match what we'll use in adminRoles
export const ROLE_OWNER = 'owner';
export const ROLE_ADMIN = 'admin';
export const ROLE_USER = 'user';

export const OwnerRole = ac.newRole({
  project: [...statement.project],
  ...adminAc.statements,
});

export const AdminRole = ac.newRole({
  project: [...statement.project],
});

export const UserRole = ac.newRole({
  project: [],
});
