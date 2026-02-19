/**
 * User Role Constants
 * Defines available user roles in the application
 */
// // ADMIN
//   BUYER
//   SOLVER
export const USER_ROLE = {
  BUYER: 'BUYER',
  SOLVER: 'SOLVER',
  ADMIN: 'ADMIN',
} as const;

/**
 * Array of all available user roles
 * This is automatically generated from USER_ROLE to ensure consistency
 */
export const UserRole = Object.values(USER_ROLE) as readonly string[];
