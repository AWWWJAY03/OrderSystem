/**
 * Order Management System - Google Apps Script Backend
 * 
 * This script provides REST API endpoints for:
 * - Product management
 * - Order creation and tracking
 * - Address data
 * - Payment confirmation
 * - Messenger/Instagram webhook
 * - J&T booking triggers
 * - Email notifications
 * 
 * Setup Instructions:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code into Code.gs
 * 3. Create a Google Sheet with columns: Inventory and Orders (see schema below)
 * 4. Set Script Properties via File > Project settings > Script properties:
 *    - SHEET_ID: Your Google Sheet ID
 *    - ADMIN_TOKEN: Secure random string for admin authentication
 *    - MAYA_SECRET_KEY: Your Maya for Business secret key
 *    - MAYA_PUBLIC_KEY: Your Maya public key
 *    - META_PAGE_TOKEN: Your Meta Page Access Token
 *    - META_VERIFY_TOKEN: Random string for webhook verification
 *    - SHOP_EMAIL: Your shop email address
 *    - JNTT_USERNAME: Your J&T Express account username
 *    - JNTT_PASSWORD: Your J&T Express account password
 * 5. Deploy as web app (Publish > Deploy as web app)
 * 6. Set Execute as: Me (your email)
 * 7. Set Who has access: Anyone, even anonymous
 * 8. Copy the web app URL and update frontend config
 */

// Configuration - Get from Script Properties
const CONFIG = {
  sheetId: () => PropertiesService.getScriptProperties().getProperty('SHEET_ID'),
  adminToken: () => PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN'),
  mayaSecretKey: () => PropertiesService.getScriptProperties().getProperty('MAYA_SECRET_KEY'),
  mayaPublicKey: () => PropertiesService.getScriptProperties().getProperty('MAYA_PUBLIC_KEY'),
  metaPageToken: () => PropertiesService.getScriptProperties().getProperty('META_PAGE_TOKEN'),
  metaVerifyToken: () => PropertiesService.getScriptProperties().getProperty('META_VERIFY_TOKEN'),
  shopEmail: () => PropertiesService.getScriptProperties().getProperty('SHOP_EMAIL') || Session.getActiveUser().getEmail(),
  jnttUsername: () => PropertiesService.getScriptProperties().getProperty('JNTT_USERNAME'),
  jnttPassword: () => PropertiesService.getScriptProperties().getProperty('JNTT_PASSWORD'),
};

// Get sheet references
function getInventorySheet() {
  const sheet = SpreadsheetApp.openById(CONFIG.sheetId());
  return sheet.getSheetByName('Inventory') || sheet.insertSheet('Inventory');
}

function getOrdersSheet() {
  const sheet = SpreadsheetApp.openById(CONFIG.sheetId());
  return sheet.getSheetByName('Orders') || sheet.insertSheet('Orders');
}

/**
 * Handle GET requests
 */
function doGet(e) {
  const action = e.parameter.action || e.parameter[''];
  
  try {
    // CORS headers for web requests
    const response = {};
    
    switch (action) {
      case 'getProducts':
      case '': // Default action
        response.data = getProducts();
        break;
      case 'getProduct':
        response.data = getProduct(e.parameter.id);
        break;
      case 'getOrders':
        response.data = getOrders(e.parameter);
        break;
      case 'getAddress':
        response.data = getAddress(e.parameter);
        break;
      // Meta webhook verification
      case 'messengerWebhook':
        if (e.parameter['hub.mode'] === 'subscribe' && e.parameter['hub.verify_token'] === CONFIG.metaVerifyToken()) {
          return ContentService.createTextOutput(e.parameter['hub.challenge']);
        }
        throw new Error('Invalid webhook verification');
      default:
        response.error = 'Invalid action';
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  const postData = JSON.parse(e.postData?.contents || '{}');
  
  try {
    // CORS headers
    const response = {};
    
    // Determine action from postData
    const action = postData.action || e.parameter?.action;
    
    switch (action) {
      case 'createOrder':
        response.data = createOrder(postData);
        break;
      case 'confirmPayment':
        response.data = confirmPayment(postData);
        break;
      case 'updateOrderStatus':
        response.data = updateOrderStatus(postData);
        break;
      case 'triggerJtBooking':
        response.data = triggerJtBooking(postData);
        break;
      case 'messengerWebhook':
        response.data = handleMessengerWebhook(postData);
        break;
      case 'sendEmail':
        response.data = sendOrderEmail(postData);
        break;
      default:
        response.error = 'Invalid action';
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get all products from Inventory sheet
 */
function getProducts() {
  const sheet = getInventorySheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    products.push({
      ProductID: row[0],
      Name: row[1],
      Description: row[2],
      Category: row[3],
      Size: row[4],
      Price: row[5],
      Stock: row[6],
      QRCodeURL: row[7],
    });
  }
  
  return products;
}

/**
 * Get single product by ID
 */
function getProduct(productId) {
  const products = getProducts();
  return products.find(p => p.ProductID === productId) || null;
}

/**
 * Create a new order
 */
function createOrder(orderData) {
  const sheet = getOrdersSheet();
  
  // Generate Order ID
  const orderId = 'ORD-' + new Date().getTime();
  
  // Get product details
  const product = getProduct(orderData.productId);
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check stock
  if (product.Stock < orderData.quantity) {
    throw new Error('Insufficient stock');
  }
  
  // Prepare order row
  const orderRow = [
    orderId,
    '', // TrackingNumber (generated after payment)
    orderData.source || 'Web',
    orderData.productId,
    product.Name,
    orderData.quantity,
    orderData.customerName,
    orderData.email,
    orderData.province,
    orderData.city,
    orderData.barangay,
    orderData.addressDetails,
    orderData.contact,
    'Pending', // PaymentStatus
    'Pending', // ShippingStatus
    '', // JNTTracking
    new Date().toISOString(), // Date
    '', // AdminNotes
  ];
  
  // Add to sheet
  sheet.appendRow(orderRow);
  
  // Update stock
  updateStock(orderData.productId, product.Stock - orderData.quantity);
  
  return { orderId, message: 'Order created successfully' };
}

/**
 * Confirm payment (Maya webhook)
 */
function confirmPayment(paymentData) {
  // Validate Maya signature (implement based on Maya docs)
  const isValidPayment = validateMayaPayment(paymentData);
  
  if (!isValidPayment) {
    throw new Error('Invalid payment signature');
  }
  
  const orderId = paymentData.orderId;
  const sheet = getOrdersSheet();
  const data = sheet.getDataRange().getValues();
  
  // Find order row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      // Generate tracking number
      const trackingNumber = 'TRK-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + 
        String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      
      // Update order
      sheet.getRange(i + 1, 10).setValue(trackingNumber); // TrackingNumber
      sheet.getRange(i + 1, 15).setValue('Paid'); // PaymentStatus
      sheet.getRange(i + 1, 16).setValue('Ready to Ship'); // ShippingStatus
      
      // Send confirmation email
      const orderData = {
        OrderID: data[i][0],
        CustomerName: data[i][6],
        Email: data[i][7],
        ProductName: data[i][4],
        Quantity: data[i][5],
        Amount: paymentData.amount,
        TrackingNumber: trackingNumber,
      };
      
      sendOrderConfirmationEmail(orderData);
      
      return { message: 'Payment confirmed' };
    }
  }
  
  throw new Error('Order not found');
}

/**
 * Update order status (admin function)
 */
function updateOrderStatus(data) {
  // Validate admin token
  if (data.token !== CONFIG.adminToken()) {
    throw new Error('Unauthorized');
  }
  
  const sheet = getOrdersSheet();
  const orderRows = sheet.getDataRange().getValues();
  
  const orderId = data.orderId;
  const status = data.status;
  
  // Find and update order
  for (let i = 1; i < orderRows.length; i++) {
    if (orderRows[i][0] === orderId) {
      // Update based on status type
      if (status.PaymentStatus) {
        sheet.getRange(i + 1, 15).setValue(status.PaymentStatus);
      }
      if (status.ShippingStatus) {
        sheet.getRange(i + 1, 16).setValue(status.ShippingStatus);
      }
      if (status.JNTTracking) {
        sheet.getRange(i + 1, 17).setValue(status.JNTTracking);
      }
      if (status.AdminNotes) {
        sheet.getRange(i + 1, 19).setValue(status.AdminNotes);
      }
      
      return { message: 'Order updated successfully' };
    }
  }
  
  throw new Error('Order not found');
}

/**
 * Get orders with optional filters
 */
function getOrders(filters) {
  const sheet = getOrdersSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const orders = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    
    // Apply filters
    if (filters.paymentStatus && row[14] !== filters.paymentStatus) continue;
    if (filters.shippingStatus && row[15] !== filters.shippingStatus) continue;
    if (filters.dateFrom && row[18] < filters.dateFrom) continue;
    if (filters.dateTo && row[18] > filters.dateTo) continue;
    
    orders.push({
      OrderID: row[0],
      TrackingNumber: row[1],
      Source: row[2],
      ProductID: row[3],
      ProductName: row[4],
      Quantity: row[5],
      CustomerName: row[6],
      Email: row[7],
      Province: row[8],
      City: row[9],
      Barangay: row[10],
      AddressDetails: row[11],
      Contact: row[12],
      PaymentStatus: row[13],
      ShippingStatus: row[14],
      JNTTracking: row[15],
      Date: row[17],
      AdminNotes: row[18],
      Price: getProduct(row[3])?.Price || 0,
    });
  }
  
  return orders;
}

/**
 * Get address data from J&T Express API
 */
function getAddress(params) {
  const level = params.level;
  const parentId = params.parentId || '';
  
  // Cache in CacheService to avoid rate limits
  const cache = CacheService.getScriptCache();
  const cacheKey = `address_${level}_${parentId}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Call J&T Express API
  let url = 'https://ylofficialjw.jtexpress.ph/website/base/info/area?countryCode=PH&current=1&size=9999';
  
  // For city and barangay, add parentId
  if (parentId) {
    url = `https://ylofficialjw.jtexpress.ph/website/base/info/area?countryCode=PH&parentId=${parentId}&current=1&size=9999`;
  }
  
  try {
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());
    
    // Transform J&T data format to our format
    if (data.code === 1 && data.data && data.data.records) {
      const records = data.data.records;
      
      // Extract relevant fields
      const formattedData = records.map(item => ({
        id: item.id,
        code: item.code,
        name: item.nativeName,
        type: item.type
      }));
      
      // Cache for 24 hours
      cache.put(cacheKey, JSON.stringify(formattedData), 21600); // 6 hours
      
      return formattedData;
    }
    
    return [];
  } catch (error) {
    console.error('Address API error:', error);
    return [];
  }
}

/**
 * Messenger/Instagram webhook handler
 */
function handleMessengerWebhook(postData) {
  if (postData.object === 'page' || postData.object === 'instagram') {
    postData.entry?.forEach(entry => {
      entry.messaging?.forEach(event => {
        if (event.message && event.message.text) {
          handleMessengerMessage(event);
        }
      });
    });
  }
  return { message: 'OK' };
}

/**
 * Handle incoming Messenger message
 */
function handleMessengerMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text.toLowerCase();
  
  // Parse order intent (basic implementation)
  // In production, use NLP or structured commands
  if (messageText.includes('order') || messageText.includes('buy')) {
    // Extract product and quantity
    const matches = messageText.match(/(\d+)\s*x?\s*(\w+)/);
    if (matches) {
      const quantity = parseInt(matches[1]);
      const productKeyword = matches[2];
      
      // Find product
      const products = getProducts();
      const product = products.find(p => 
        p.Name.toLowerCase().includes(productKeyword) ||
        p.Category.toLowerCase().includes(productKeyword)
      );
      
      if (product) {
        // Send product details
        sendMessengerMessage(senderId, 
          `You want to order ${quantity}x ${product.Name} for ₱${product.Price * quantity}. ` +
          `Reply YES to confirm or provide your details.`
        );
        
        // In production, implement conversation state machine
      }
    }
  }
  
  // Handle confirmation
  if (messageText === 'yes' || messageText === 'confirm') {
    sendMessengerMessage(senderId,
      `Great! Please provide your:\n` +
      `1. Full name\n` +
      `2. Email\n` +
      `3. Contact number\n` +
      `4. Complete address\n` +
      `5. Province, City, Barangay`
    );
  }
}

/**
 * Send message via Messenger API
 */
function sendMessengerMessage(recipientId, message) {
  const url = `https://graph.facebook.com/v18.0/me/messages`;
  const payload = {
    recipient: { id: recipientId },
    message: { text: message },
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.metaPageToken()}`
    },
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}

/**
 * Trigger J&T booking (for admin dashboard)
 */
function triggerJtBooking(data) {
  // Validate admin token
  if (data.token !== CONFIG.adminToken()) {
    throw new Error('Unauthorized');
  }
  
  const orderIds = data.orderIds || [];
  
  // Return booking info for automation
  return {
    message: 'J&T booking triggered',
    orderIds: orderIds,
    credentials: {
      username: CONFIG.jnttUsername(),
      password: CONFIG.jnttPassword(),
    },
    webhookUrl: ScriptApp.getService().getUrl(),
  };
}

/**
 * Send order confirmation email
 */
function sendOrderConfirmationEmail(orderData) {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #007AFF;">Order Confirmed!</h2>
      <p>Hi ${orderData.CustomerName},</p>
      <p>Thank you for your order. Here are your order details:</p>
      
      <div style="background: #F2F2F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Summary</h3>
        <p><strong>Order ID:</strong> ${orderData.OrderID}</p>
        <p><strong>Tracking Number:</strong> ${orderData.TrackingNumber}</p>
        <p><strong>Product:</strong> ${orderData.ProductName}</p>
        <p><strong>Quantity:</strong> ${orderData.Quantity}</p>
        <p><strong>Amount:</strong> ₱${orderData.Amount}</p>
      </div>
      
      <p>Your order is being prepared and will be shipped via J&T Express.</p>
      <p>You will receive a shipping confirmation email with tracking details once your order is shipped.</p>
      
      <p>Thank you for your business!</p>
    </div>
  `;
  
  GmailApp.sendEmail(
    orderData.Email,
    `Order Confirmation - ${orderData.OrderID}`,
    '',
    {
      htmlBody: htmlBody,
      from: CONFIG.shopEmail(),
    }
  );
}

/**
 * Send order email (from admin panel)
 */
function sendOrderEmail(data) {
  if (data.token !== CONFIG.adminToken()) {
    throw new Error('Unauthorized');
  }
  
  // Get order details
  const orders = getOrders({});
  const order = orders.find(o => o.OrderID === data.orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  sendOrderConfirmationEmail({
    CustomerName: order.CustomerName,
    Email: order.Email,
    OrderID: order.OrderID,
    TrackingNumber: order.TrackingNumber,
    ProductName: order.ProductName,
    Quantity: order.Quantity,
    Amount: order.Price * order.Quantity,
  });
  
  return { message: 'Email sent successfully' };
}

/**
 * Helper: Update product stock
 */
function updateStock(productId, newStock) {
  const sheet = getInventorySheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productId) {
      sheet.getRange(i + 1, 7).setValue(newStock); // Stock column
      break;
    }
  }
}

/**
 * Helper: Validate Maya payment (implement based on Maya docs)
 */
function validateMayaPayment(paymentData) {
  // TODO: Implement Maya signature validation
  // For now, return true (in production, validate signature)
  return true;
}
