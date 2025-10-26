// Configuration for the order system
// Update these URLs with your deployed Apps Script URL after deployment

export const config = {
  // Google Apps Script Web App URL
  // Deploy your Code.gs as a web app and paste the URL here
  apiUrl: process.env.VITE_APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_URL_HERE',
  
  // Admin Dashboard Token
  // Set this to a secure random string
  adminToken: process.env.VITE_ADMIN_TOKEN || 'change-this-to-a-secure-random-string',
  
  // Maya Checkout Public Key (sandbox for testing)
  mayaPublicKey: process.env.VITE_MAYA_PUBLIC_KEY || '',
  
  // Meta Page Access Token (for Messenger/Instagram)
  metaPageToken: process.env.VITE_META_PAGE_TOKEN || '',
  
  // Google Sheet ID (found in the URL)
  sheetId: process.env.VITE_SHEET_ID || '',
  
  // Address API
  addressApiUrl: 'https://psgc.gitlab.io/api',
  
  // PayPal Client ID (if using PayPal as fallback)
  paypalClientId: process.env.VITE_PAYPAL_CLIENT_ID || '',
};

export default config;
