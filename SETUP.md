# Detailed Setup Guide

This guide will walk you through setting up the Order Management System step by step.

## Prerequisites

- A Google account
- A GitHub account
- Node.js 18+ installed
- A Maya for Business account (optional, for payments)
- A Meta Business account (optional, for Messenger/Instagram)

## Step-by-Step Setup

### 1. Local Development Setup

#### Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd order-system

# Install frontend dependencies
npm install

# Install automation dependencies
cd automation
npm install
cd ..
```

#### Configure Environment Variables

1. Copy `env.example` to `.env`:
```bash
cp env.example .env
```

2. You'll fill in these values as you complete the setup steps below.

### 2. Google Sheets Setup

#### Create Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Order System"
4. Note the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

#### Create Inventory Sheet

1. In your spreadsheet, name the first sheet "Inventory"
2. Add the following headers in row 1:
   - ProductID
   - Name
   - Description
   - Category
   - Size
   - Price
   - Stock
   - QRCodeURL

3. Add sample products (or import from `sample-inventory.csv`)

#### Create Orders Sheet

1. Insert a new sheet named "Orders"
2. Add the following headers in row 1:
   - OrderID
   - TrackingNumber
   - Source
   - ProductID
   - ProductName
   - Quantity
   - CustomerName
   - Email
   - Province
   - City
   - District
   - Barangay
   - AddressDetails
   - Contact
   - PaymentStatus
   - ShippingStatus
   - JNTTracking
   - Date
   - AdminNotes

#### Set Permissions

1. Click "Share" button
2. Add the email that will run the Apps Script
3. Give "Editor" access
4. Copy the Sheet ID and save it for later

### 3. Google Apps Script Setup

#### Create Script

1. Go to [Apps Script](https://script.google.com)
2. Click "New Project"
3. Name it "Order System Backend"
4. Replace the default code with the contents of `backend/Code.gs`

#### Configure Script Properties

1. In Apps Script, go to Project Settings (gear icon)
2. Click "Script Properties" tab
3. Add the following properties:

| Property | Value | Description |
|----------|-------|-------------|
| SHEET_ID | Your Sheet ID | From step 2 |
| ADMIN_TOKEN | Random string | Generate: `openssl rand -hex 32` |
| MAYA_SECRET_KEY | Your Maya secret | From Maya dashboard |
| MAYA_PUBLIC_KEY | Your Maya public key | From Maya dashboard |
| META_PAGE_TOKEN | Your Meta token | From Meta for Developers |
| META_VERIFY_TOKEN | Random string | Generate randomly |
| SHOP_EMAIL | your@email.com | Your business email |
| JNTT_USERNAME | Your J&T username | Your J&T account |
| JNTT_PASSWORD | Your J&T password | Your J&T account |

**Note**: Leave JNTT fields empty for now if you haven't set up J&T yet.

#### Deploy as Web App

1. Click "Deploy" > "New deployment"
2. Select type: "Web app"
3. Description: "Order System API"
4. Execute as: "Me (your@email.com)"
5. Who has access: "Anyone"
6. Click "Deploy"
7. Copy the Web app URL
8. Update your `.env` file:
   ```
   VITE_APPS_SCRIPT_URL=<your-web-app-url>
   VITE_ADMIN_TOKEN=<same-as-ScriptProperties>
   VITE_SHEET_ID=<your-sheet-id>
   ```

### 4. Frontend Configuration

#### Update Config

The frontend is already configured to read from `.env` file. Make sure your `.env` contains:

```bash
VITE_APPS_SCRIPT_URL=<your-apps-script-url>
VITE_ADMIN_TOKEN=<your-admin-token>
VITE_SHEET_ID=<your-sheet-id>
```

#### Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to see your store.

#### Generate QR Codes

For each product in your Inventory sheet, generate a QR code:

1. Use the Google Chart API format:
```
https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=YOUR_DOMAIN/order?id=PROD-001
```

2. Update the QRCodeURL column in your Inventory sheet

### 5. Deploy Frontend

#### Option A: Deploy to Vercel (Recommended)

1. Sign up at [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Import the project
4. Add environment variables in Vercel dashboard:
   - VITE_APPS_SCRIPT_URL
   - VITE_ADMIN_TOKEN
   - VITE_MAYA_PUBLIC_KEY
   - VITE_SHEET_ID
5. Deploy
6. Your site will be live at `https://your-project.vercel.app`

#### Option B: Deploy to GitHub Pages

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy to GitHub Pages when you push to `main` branch.

To enable:
1. Go to your repository Settings
2. Navigate to "Pages"
3. Source: "GitHub Actions"
4. Push to main branch to trigger deployment

### 6. Maya Payment Setup (Optional)

#### Get API Keys

1. Sign up for [Maya for Business](https://maya.ph/business)
2. Complete merchant verification
3. Get your API keys from the dashboard:
   - Public Key
   - Secret Key

#### Configure Webhook

1. In Maya dashboard, go to "Webhooks"
2. Add webhook URL: `YOUR_APPS_SCRIPT_URL?action=confirmPayment`
3. Set event: "Payment Success"

#### Update Configuration

1. Update `.env`:
   ```
   VITE_MAYA_PUBLIC_KEY=<your-maya-public-key>
   ```

2. Update Apps Script Properties:
   ```
   MAYA_SECRET_KEY=<your-maya-secret-key>
   MAYA_PUBLIC_KEY=<your-maya-public-key>
   ```

### 7. Messenger/Instagram Setup (Optional)

#### Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Click "My Apps" > "Create App"
3. App type: "Business"
4. Name your app and create

#### Add Products

1. In your app, click "Add Product"
2. Select "Messenger"
3. Select "Instagram"

#### Get Page Access Token

1. Go to "Messenger" > "Settings"
2. Select your Facebook Page
3. Generate Page Access Token
4. Copy the token

#### Set Up Webhook

1. Go to "Webhooks" section
2. Click "Add Callback URL"
3. Enter:
   - Callback URL: `YOUR_APPS_SCRIPT_URL?action=messengerWebhook`
   - Verify Token: (same as META_VERIFY_TOKEN)
4. Subscribe to `messages` event
5. Save

#### Update Configuration

1. Update Apps Script Properties:
   ```
   META_PAGE_TOKEN=<your-page-token>
   META_VERIFY_TOKEN=<random-string>
   ```

### 8. J&T Express Automation Setup

#### Get J&T Credentials

1. Sign up for [J&T Express](https://www.jtexpress.ph)
2. Get your account credentials

#### Local Automation Setup

1. Create `automation/.env` file:
```bash
cp ../env.example automation/.env
```

2. Fill in J&T credentials:
```bash
JNTT_USERNAME=your_username
JNTT_PASSWORD=your_password
```

3. Fill in shop information:
```bash
SHOP_NAME=Your Shop
SHOP_CONTACT=+639123456789
SHOP_ADDRESS=123 Main Street
SHOP_PROVINCE=Metro Manila
SHOP_CITY=Manila
SHOP_BARANGAY=Your Barangay
```

4. Run automation:
```bash
cd automation
npm install
npx playwright install chromium

# Test with single order
node jt_booking.js --orderId=ORD-123

# Or run bulk
node jt_booking.js --bulk
```

#### GitHub Actions Setup

1. Go to your GitHub repository
2. Navigate to "Settings" > "Secrets"
3. Add the following secrets:
   - `APPS_SCRIPT_URL`
   - `JNTT_USERNAME`
   - `JNTT_PASSWORD`
   - `SHOP_NAME`
   - `SHOP_CONTACT`
   - `SHOP_ADDRESS`
   - `SHOP_PROVINCE`
   - `SHOP_CITY`
   - `SHOP_BARANGAY`

4. Trigger automation via Actions tab or admin dashboard

### 9. Testing

#### Test Products Page

1. Visit your deployed site
2. You should see your products from the Inventory sheet
3. Click on a product to view details

#### Test Order Flow

1. Select a product
2. Fill in order details
3. Complete the order
4. Check the Orders sheet - you should see the new order

#### Test Admin Dashboard

1. Visit `YOUR_SITE/admin`
2. Enter your admin token
3. You should see the orders table
4. Test filtering and actions

#### Test Messenger Webhook

1. Send a message to your Facebook Page
2. The bot should respond (basic responses implemented)
3. Check Apps Script execution logs for any errors

#### Test J&T Automation

1. Create a test order
2. Mark it as paid in admin dashboard
3. Run automation:
   ```bash
   cd automation
   node jt_booking.js --orderId=YOUR_ORDER_ID
   ```
4. Check the Orders sheet for JNTTracking number

### 10. Production Checklist

- [ ] Google Sheets created and configured
- [ ] Apps Script deployed as web app
- [ ] Environment variables set in `.env` and deployment platform
- [ ] Frontend deployed and accessible
- [ ] Admin token is secure (long random string)
- [ ] Product QR codes generated
- [ ] Payment provider configured
- [ ] Messenger/Instagram webhook configured (optional)
- [ ] J&T automation tested
- [ ] Email notifications working
- [ ] CORS configured in Apps Script

## Troubleshooting

### "Sheet not found" error

- Check that SHEET_ID is correct in Script Properties
- Verify the email running the script has access to the sheet

### "Unauthorized" errors

- Verify ADMIN_TOKEN matches between frontend and backend
- Check Script Properties are set correctly

### Frontend won't load

- Check `VITE_APPS_SCRIPT_URL` is correct
- Ensure Apps Script is deployed and accessible
- Check browser console for CORS errors

### Automation selectors not working

- J&T portal may have changed
- Update selectors in `automation/jt_booking.js`
- Take screenshots during automation to debug

### Payment not confirming

- Check Maya webhook URL is correct
- Verify signature validation in `confirmPayment()` function
- Check Maya dashboard for webhook logs

## Next Steps

1. Customize the UI to match your brand
2. Add more products to your inventory
3. Set up automated emails for customers
4. Configure warehouse/pickup location
5. Set up analytics (Google Analytics)
6. Create branding assets (logo, colors)

## Support

For questions or issues:
- Check the main README.md
- Review code comments
- Open an issue on GitHub
