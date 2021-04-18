import { User } from '@auth0/auth0-react/dist/auth-state';

export const ROLES_NAMESPACE: string = "https://igbob/api/roles";

/**
 * Determine if user has the given role
 * @function
 * @param {User} user - The user which is being authenticated
 * @param {string} role - The required role
 * @return
 */
export function userHasAccess(user: User, role: string): boolean {
  const userRoles = user && user[ROLES_NAMESPACE];
  return userRoles && userRoles.some((r: string) => role === r);
}


