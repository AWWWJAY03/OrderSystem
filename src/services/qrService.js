import config from './config';

/**
 * Generate QR code URL using Google Chart API
 * @param {string} productId - Product ID
 * @returns {string} QR code image URL
 */
export const generateQRCodeURL = (productId) => {
  const orderUrl = `${window.location.origin}/order?id=${productId}`;
  return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(orderUrl)}`;
};

/**
 * Generate QR code for Messenger/Instagram ordering
 * @param {string} productId - Product ID
 * @returns {string} QR code image URL
 */
export const generateMessengerQR = (productId) => {
  // Format: messenger://order?product=PROD-001
  const messengerUrl = `messenger://order?product=${productId}`;
  return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(messengerUrl)}`;
};

/**
 * Download QR code as image
 * @param {string} qrUrl - QR code URL
 * @param {string} filename - Filename for download
 */
export const downloadQR = (qrUrl, filename = 'qrcode.png') => {
  fetch(qrUrl)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
};

export default {
  generateQRCodeURL,
  generateMessengerQR,
  downloadQR,
};
