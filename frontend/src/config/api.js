// Central API configuration
// Change VITE_API_URL in .env to switch between local and deployed backend
const BASE_URL = import.meta.env.VITE_API_URL || 'https://codewizrds-deploy.onrender.com';

export const API = {
  base: BASE_URL,
  auth: {
    login: `${BASE_URL}/api/auth/login`,
    signup: `${BASE_URL}/api/auth/signup`,
    hospitals: `${BASE_URL}/api/auth/hospitals`,
    registerHospital: `${BASE_URL}/api/auth/register-hospital`,
    me: `${BASE_URL}/api/auth/me`,
    logout: `${BASE_URL}/api/auth/logout`,
  },
  staff: `${BASE_URL}/api/staff`,
  patients: `${BASE_URL}/api/patients`,
  emergency: `${BASE_URL}/api/emergency`,
  lab: `${BASE_URL}/api/lab`,
  radiology: `${BASE_URL}/api/radiology`,
  surgery: `${BASE_URL}/api/surgery`,
  opd: `${BASE_URL}/api/opd`,
  maternity: `${BASE_URL}/api/maternity`,
  ambulances: `${BASE_URL}/api/ambulances`,
  notifications: `${BASE_URL}/api/notifications`,
};

export default API;
