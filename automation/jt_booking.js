/**
 * J&T Express Booking Automation
 * 
 * This script automates the J&T Express booking process using Playwright.
 * 
 * Setup:
 * 1. Install dependencies: npm install playwright dotenv
 * 2. Configure .env file with credentials
 * 3. Run: node automation/jt_booking.js
 * 
 * Usage:
 * - Single order: node automation/jt_booking.js --orderId=ORD-123
 * - Bulk orders: node automation/jt_booking.js --bulk
 * - Custom mode: See --help for options
 */

require('dotenv').config();
const { chromium } = require('playwright');
const axios = require('axios');

// Configuration from .env
const CONFIG = {
  appsScriptUrl: process.env.APPS_SCRIPT_URL || '',
  jnttUsername: process.env.JNTT_USERNAME || '',
  jnttPassword: process.env.JNTT_PASSWORD || '',
  jnttBaseUrl: process.env.JNTT_BASE_URL || 'https://www.jtexpress.ph',
  shopInfo: {
    name: process.env.SHOP_NAME || 'Your Shop',
    contact: process.env.SHOP_CONTACT || '+639123456789',
    address: process.env.SHOP_ADDRESS || 'Your Shop Address',
    province: process.env.SHOP_PROVINCE || 'Metro Manila',
    city: process.env.SHOP_CITY || 'Manila',
    barangay: process.env.SHOP_BARANGAY || 'Your Barangay',
  },
};

// Order data structure
let ordersToProcess = [];
let results = {
  success: [],
  failed: [],
  total: 0,
};

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const orderId = getArgValue(args, '--orderId');
  const bulk = args.includes('--bulk');

  console.log('🚀 J&T Express Booking Automation');
  console.log('================================\n');

  try {
    // Fetch orders to process
    if (orderId) {
      console.log(`📦 Processing single order: ${orderId}`);
      await fetchOrder(orderId);
    } else if (bulk) {
      console.log('📦 Processing bulk orders');
      await fetchBulkOrders();
    } else {
      console.error('Usage: node jt_booking.js --orderId=ORD-123 OR --bulk');
      process.exit(1);
    }

    if (ordersToProcess.length === 0) {
      console.log('No orders to process.');
      return;
    }

    console.log(`Found ${ordersToProcess.length} order(s) to process.\n`);

    // Launch browser
    const browser = await chromium.launch({
      headless: true, // Set to false to see the browser
    });

    // Process each order
    for (const order of ordersToProcess) {
      await processOrder(browser, order);
    }

    await browser.close();

    // Print summary
    printSummary();

    // Send results to Apps Script
    await sendResultsToBackend();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * Fetch single order from Apps Script
 */
async function fetchOrder(orderId) {
  try {
    const response = await axios.get(`${CONFIG.appsScriptUrl}`, {
      params: {
        action: 'getOrder',
        orderId: orderId,
      },
    });
    ordersToProcess = [response.data.data];
  } catch (error) {
    console.error('Failed to fetch order:', error.message);
    throw error;
  }
}

/**
 * Fetch bulk orders from Apps Script
 */
async function fetchBulkOrders() {
  try {
    const response = await axios.get(`${CONFIG.appsScriptUrl}`, {
      params: {
        action: 'getOrders',
        shippingStatus: 'Ready to Ship',
      },
    });
    ordersToProcess = response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error.message);
    throw error;
  }
}

/**
 * Process a single order
 */
async function processOrder(browser, order) {
  console.log(`\n📦 Processing: ${order.OrderID}`);
  console.log(`   Customer: ${order.CustomerName}`);
  console.log(`   Product: ${order.ProductName} x${order.Quantity}`);

  const page = await browser.newPage();
  
  try {
    // Login to J&T
    console.log('   🔐 Logging in...');
    await loginToJT(page);

    // Navigate to booking page
    console.log('   📝 Opening booking form...');
    await openBookingForm(page);

    // Fill booking form
    console.log('   ✍️  Filling form...');
    await fillBookingForm(page, order);

    // Submit booking
    console.log('   📤 Submitting booking...');
    const trackingNumber = await submitBooking(page);

    // Update order in backend
    console.log('   💾 Updating order...');
    await updateOrderInBackend(order.OrderID, trackingNumber);

    results.success.push({
      orderId: order.OrderID,
      trackingNumber: trackingNumber,
    });

    console.log(`   ✅ Success! Tracking: ${trackingNumber}`);

  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    results.failed.push({
      orderId: order.OrderID,
      error: error.message,
    });
  } finally {
    await page.close();
  }
}

/**
 * Login to J&T Express portal
 */
async function loginToJT(page) {
  await page.goto(`${CONFIG.jnttBaseUrl}/login`);
  
  // Wait for login form
  await page.waitForSelector('input[type="text"], input[name="username"], #username');
  
  // Fill credentials
  // NOTE: These selectors may need adjustment based on actual J&T portal
  await page.fill('input[name="username"], #username', CONFIG.jnttUsername);
  await page.fill('input[name="password"], #password', CONFIG.jnttPassword);
  
  // Click login button
  await page.click('button[type="submit"], .btn-login, button:has-text("Login")');
  
  // Wait for navigation
  await page.waitForTimeout(3000);
  
  // Verify login success
  const currentUrl = page.url();
  if (currentUrl.includes('login')) {
    throw new Error('Login failed - check credentials');
  }
}

/**
 * Open booking form
 */
async function openBookingForm(page) {
  // Navigate to booking/create order page
  // NOTE: This URL may vary for different J&T portals
  await page.goto(`${CONFIG.jnttBaseUrl}/booking/create`);
  
  // Wait for form to load
  await page.waitForTimeout(2000);
}

/**
 * Fill booking form with order details
 */
async function fillBookingForm(page, order) {
  try {
    // Sender Information (Shop)
    await fillField(page, 'Sender Name', CONFIG.shopInfo.name);
    await fillField(page, 'Sender Contact', CONFIG.shopInfo.contact);
    await fillField(page, 'Sender Address', CONFIG.shopInfo.address);
    await fillField(page, 'Sender Province', CONFIG.shopInfo.province);
    await fillField(page, 'Sender City', CONFIG.shopInfo.city);
    await fillField(page, 'Sender Barangay', CONFIG.shopInfo.barangay);

    // Receiver Information (Customer)
    await fillField(page, 'Receiver Name', order.CustomerName);
    await fillField(page, 'Receiver Contact', order.Contact);
    await fillField(page, 'Receiver Address', order.AddressDetails);
    await fillField(page, 'Receiver Province', order.Province);
    await fillField(page, 'Receiver City', order.City);
    await fillField(page, 'Receiver District', order.District);
    await fillField(page, 'Receiver Barangay', order.Barangay);

    // Package Information
    await fillField(page, 'Package Size', order.PackageSize || 'Small');
    await fillField(page, 'Item Category', order.ItemCategory || 'Electronics');
    await fillField(page, 'Weight', '1'); // Default weight
    await fillField(page, 'Quantity', order.Quantity);

    // Payment - COD or Prepaid
    await fillField(page, 'Payment Type', 'Prepaid'); // Adjust as needed

  } catch (error) {
    console.log(`   ⚠️  Field filling error: ${error.message}`);
    // Continue anyway - some fields might not exist
  }
}

/**
 * Helper: Fill a field by label or name
 */
async function fillField(page, label, value) {
  try {
    // Try multiple strategies to find the field
    const selectors = [
      `input[name="${label}"]`,
      `input[placeholder*="${label}"]`,
      `select[name="${label}"]`,
      `input[label="${label}"]`,
      `textarea[name="${label}"]`,
    ];
    
    for (const selector of selectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        await page.fill(selector, value);
        return;
      }
    }
    
    // Try to find by nearby label text
    const labelElements = await page.$$(`text=${label}`);
    for (const labelEl of labelElements) {
      const input = await labelEl.evaluateHandle(el => {
        const form = el.closest('form');
        if (form) {
          const inputs = form.querySelectorAll('input, select, textarea');
          for (const inp of inputs) {
            if (inp.type !== 'submit' && inp.type !== 'button') {
              return inp;
            }
          }
        }
        return null;
      });
      
      if (input && input !== null) {
        await input.fill(value);
        return;
      }
    }
    
    console.log(`   ⚠️  Could not find field: ${label}`);
  } catch (error) {
    // Field not found - skip it
    console.log(`   ⚠️  Error filling field ${label}: ${error.message}`);
  }
}

/**
 * Submit booking and extract tracking number
 */
async function submitBooking(page) {
  // Click submit button
  await page.click('button[type="submit"], .btn-submit, button:has-text("Submit"), button:has-text("Book")');
  
  // Wait for confirmation
  await page.waitForTimeout(5000);
  
  // Extract tracking number from page
  // NOTE: This selector will need adjustment based on actual J&T portal
  const trackingElement = await page.$('.tracking-number, #trackingNumber, .order-number');
  
  if (trackingElement) {
    const trackingNumber = await trackingElement.textContent();
    return trackingNumber.trim();
  }
  
  // Fallback: Check if tracking number is in URL or page content
  const url = page.url();
  const trackingMatch = url.match(/tracking[=\/](\w+)/i);
  if (trackingMatch) {
    return trackingMatch[1];
  }
  
  // Take screenshot for debugging
  await page.screenshot({ path: `booking-${Date.now()}.png` });
  
  // Return a placeholder if tracking not found
  return 'TRACKING-PENDING';
}

/**
 * Update order in Apps Script backend
 */
async function updateOrderInBackend(orderId, trackingNumber) {
  try {
    await axios.post(`${CONFIG.appsScriptUrl}`, {
      action: 'updateOrderStatus',
      orderId: orderId,
      status: {
        ShippingStatus: 'Shipped',
        JNTTracking: trackingNumber,
      },
      token: CONFIG.appsScriptUrl, // This should be your admin token
    });
  } catch (error) {
    console.error('Failed to update backend:', error.message);
  }
}

/**
 * Send results summary to backend
 */
async function sendResultsToBackend() {
  results.total = ordersToProcess.length;
  
  try {
    await axios.post(`${CONFIG.appsScriptUrl}`, {
      action: 'jtCallback',
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to send results to backend:', error.message);
  }
}

/**
 * Print summary
 */
function printSummary() {
  console.log('\n================================');
  console.log('📊 Summary');
  console.log('================================');
  console.log(`Total Orders: ${results.total}`);
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.success.length > 0) {
    console.log('\nSuccessful Bookings:');
    results.success.forEach(r => {
      console.log(`  ${r.orderId}: ${r.trackingNumber}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log('\nFailed Bookings:');
    results.failed.forEach(r => {
      console.log(`  ${r.orderId}: ${r.error}`);
    });
  }
}

/**
 * Helper: Get command line argument value
 */
function getArgValue(args, key) {
  const arg = args.find(a => a.startsWith(key));
  return arg ? arg.split('=')[1] : null;
}

// Run main function
main();
