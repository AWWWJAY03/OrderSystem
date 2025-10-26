import config from './config';

// Initialize Maya checkout
export const initMayaCheckout = async (amount, orderData) => {
  try {
    // Redirect to Maya checkout
    // In production, use Maya SDK or redirect to their checkout URL
    const checkoutUrl = `https://payment-app-sandbox.mayadigital.io/v1/checkout?public_key=${config.mayaPublicKey}&amount=${amount}&order_id=${orderData.orderId}`;
    
    // Open in same window
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('Maya checkout error:', error);
    throw error;
  }
};

// Get QR code for GCash payment
export const getGCashQR = () => {
  // QRPH standard QR code
  // In production, generate this based on GCash merchant credentials
  return '/qrph.png'; // Placeholder
};

export default {
  initMayaCheckout,
  getGCashQR,
};
