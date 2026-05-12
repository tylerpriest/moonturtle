export const APP_CONFIG = {
  providerEnabled: import.meta.env.VITE_MOONTURTLE_USE_PROVIDER === 'true',
  providerEndpoint: '/api/reading',
  astronomyFramework: 'IAU actual-sky constellation lookup from observer position',
};
