// API is reached same-origin via the dev proxy at /api (the /game page route would clash with a bare /game proxy)
const apiUrl = '/api';
const apiAuthCookieName = getViteEnvVarOrThrow('VITE_MANATEES_CREDENTIAL_NAME');

export const environment = {
  apiUrl,
  apiAuthCookieName,
  allowDevLogins: import.meta.env.VITE_MANATEES_ALLOW_DEV_LOGINS === 'true',
};

function getViteEnvVarOrThrow(varName: string): string {
  const value = import.meta.env[varName];
  if (!value) {
    throw new Error(`Expected Vite environment var '${varName}' to be defined, but it was not`);
  }
  return value;
}
