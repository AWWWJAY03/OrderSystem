# Order Management System

A complete, free-to-deploy, mobile-first order management system for small businesses with QR code ordering, Facebook Messenger/Instagram integration, payment processing via Maya/GCash, and automated J&T Express booking.

## Features

- 📱 **Mobile-First**: Responsive UI inspired by Apple Store design
- 📸 **QR Code Ordering**: Customers scan QR codes to order via Messenger/Instagram
- 💳 **Payment Integration**: Maya for Business and GCash payment support
- 📊 **Google Sheets Database**: Free cloud database via Google Sheets
- 📧 **Email Notifications**: Automatic order and shipping confirmations
- 🚚 **Automated Shipping**: J&T Express booking automation with Playwright
- 🔐 **Admin Dashboard**: Secure admin panel to manage orders and track shipping
- 📍 **Philippine Address API**: Dynamic province/city/district/barangay dropdowns via PSGC API
- 🔄 **CI/CD Ready**: GitHub Actions for automated deployment

## Architecture

### Frontend (React + TailwindCSS)
- **Framework**: Vite + React
- **Routing**: React Router
- **UI**: TailwindCSS with Apple-inspired design
- **Pages**: Product grid, Order form, Success page, Admin dashboard

### Backend (Google Apps Script)
- **Runtime**: Google Apps Script (serverless)
- **Database**: Google Sheets
- **API**: REST-like web service
- **Integrations**: Gmail, Meta Graph API (Messenger/Instagram)

### Automation (Node.js + Playwright)
- **Tool**: Playwright for browser automation
- **Purpose**: J&T Express booking automation
- **Modes**: Single order or bulk booking

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd order-system
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `VITE_APPS_SCRIPT_URL`: Your deployed Apps Script URL (get this after step 3)
- `VITE_ADMIN_TOKEN`: Generate a secure random string
- `VITE_SHEET_ID`: Your Google Sheet ID
- Other API keys as needed

### 3. Set Up Google Sheets

1. Create a new Google Sheet
2. Name it "Order System"
3. Create two sheets: **Inventory** and **Orders**

#### Inventory Sheet Structure
| ProductID | Name | Description | Category | Size | Price | Stock | QRCodeURL |
|-----------|------|-------------|----------|------|-------|-------|-----------|
| PROD-001  | T-Shirt | Cotton T-Shirt | Clothing | M | 299 | 50 | https://... |

#### Orders Sheet Structure
| OrderID | TrackingNumber | Source | ProductID | ProductName | Quantity | CustomerName | Email | Province | City | District | Barangay | AddressDetails | Contact | PaymentStatus | ShippingStatus | JNTTracking | Date | AdminNotes |
|---------|----------------|--------|-----------|-------------|----------|--------------|-------|----------|------|----------|----------|----------------|---------|---------------|----------------|-------------|------|------------|

4. Get your Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

### 4. Deploy Apps Script Backend

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with `backend/Code.gs`
4. Set Script Properties (File > Project settings > Script properties):
   - `SHEET_ID`: Your Google Sheet ID
   - `ADMIN_TOKEN`: Same as in `.env` (VITE_ADMIN_TOKEN)
   - `MAYA_SECRET_KEY`: Your Maya secret key
   - `MAYA_PUBLIC_KEY`: Your Maya public key
   - `META_PAGE_TOKEN`: Your Meta Page Access Token
   - `META_VERIFY_TOKEN`: Random string for webhook verification
   - `SHOP_EMAIL`: Your email address

5. Deploy as Web App:
   - Click "Deploy" > "New deployment"
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone, even anonymous
   - Click "Deploy"
   - Copy the Web app URL

6. Update `.env` with the Web app URL:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
   ```

### 5. Set Up Meta Webhook (Messenger/Instagram)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create an app > Select "Business"
3. Add "Messenger" and "Instagram" products
4. Get Page Access Token
5. Set Webhook:
   - Callback URL: Your Apps Script URL + `?action=messengerWebhook`
   - Verify Token: Same as META_VERIFY_TOKEN
   - Subscribe to `messages` event

### 6. Set Up Maya for Business

1. Sign up for [Maya for Business](https://maya.ph/business)
2. Get your API keys (Public and Secret)
3. Configure in Apps Script (Script Properties)
4. Set up webhook URL: Your Apps Script URL + `?action=confirmPayment`

### 7. Run Frontend Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

### 8. Deploy Frontend

#### Option A: Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

#### Option B: GitHub Pages

The GitHub Actions workflow will automatically deploy to GitHub Pages on push to main.

### 9. Set Up J&T Automation

#### Local Setup

```bash
cd automation
npm install
```

Create `automation/.env`:
```env
APPS_SCRIPT_URL=your_apps_script_url
JNTT_USERNAME=your_username
JNTT_PASSWORD=your_password
SHOP_NAME=Your Shop
SHOP_CONTACT=+639123456789
SHOP_ADDRESS=123 Main St
SHOP_PROVINCE=Metro Manila
SHOP_CITY=Manila
SHOP_BARANGAY=Your Barangay
```

Run single order:
```bash
node jt_booking.js --orderId=ORD-123
```

Run bulk orders:
```bash
node jt_booking.js --bulk
```

#### GitHub Actions Setup

1. Add secrets to GitHub repository:
   - `APPS_SCRIPT_URL`
   - `JNTT_USERNAME`
   - `JNTT_PASSWORD`
   - `SHOP_NAME`, `SHOP_CONTACT`, `SHOP_ADDRESS`, etc.

2. Trigger automation:
   - Go to Actions tab
   - Select "Run J&T Booking Automation"
   - Click "Run workflow"
   - Choose mode (single or bulk)
   - Enter order IDs (for single mode)

## Usage

### For Customers

1. **Scan QR Code**: Scan the product QR code with your phone
2. **Order via Messenger**: Send order details via Messenger/Instagram
3. **Or Order Online**: Visit the website and place an order
4. **Complete Payment**: Pay via Maya or GCash
5. **Track Order**: Receive tracking number via email

### For Admins

1. **Access Admin Dashboard**: Visit `/admin` on your deployed site
2. **Enter Access Token**: Use the token from your `.env`
3. **View Orders**: See all orders with filters
4. **Mark as Paid/Shipped**: Quick actions for each order
5. **Trigger J&T Booking**: Select orders and book via J&T
6. **Download CSV**: Export orders for reporting

### Admin Dashboard Features

- **Search & Filter**: Search by name, ID, or tracking number
- **Status Filters**: Filter by payment and shipping status
- **Bulk Actions**: Select multiple orders for batch operations
- **Quick Actions**: Mark paid, mark shipped, send email, book J&T
- **Action Logs**: Track recent admin actions
- **CSV Export**: Download order data

## Security

- Admin dashboard protected by access token
- All API calls authenticated
- Sensitive data stored in Script Properties (not in code)
- Environment variables for local development

## Customization

### Change UI Theme

Edit `tailwind.config.js` and `src/index.css`

### Add New Payment Method

1. Add to `src/services/paymentService.js`
2. Update order form in `src/pages/OrderForm.jsx`
3. Add webhook handler in `backend/Code.gs`

### Modify Address Dropdowns

Update `getAddress()` function in `backend/Code.gs` to use a different API.

### Customize J&T Automation

Edit `automation/jt_booking.js` selectors and flow as needed.

## Troubleshooting

### Frontend not loading
- Check `VITE_APPS_SCRIPT_URL` in `.env`
- Ensure Apps Script is deployed and public

### Orders not saving
- Check Google Sheet permissions (App Script needs edit access)
- Verify Sheet ID in Script Properties

### Payment not confirming
- Check Maya webhook URL and signature validation
- Verify Maya credentials in Script Properties

### Automation failing
- Check J&T login credentials
- Update field selectors in `jt_booking.js`
- Review screenshots saved during automation

### Messenger webhook not working
- Verify webhook URL and token
- Check Meta Page Access Token
- Ensure App Script URL is accessible from Meta

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Free to use and modify for your business.

## Support

For issues and questions:
- Create an issue in GitHub
- Check existing documentation
- Review code comments for inline documentation

## Acknowledgments

- **Google Apps Script**: Backend hosting
- **Google Sheets**: Database
- **Playwright**: Browser automation
- **React + TailwindCSS**: Frontend framework
- **PSGC API**: Philippine address data
- **Meta**: Messenger and Instagram integration
- **Maya for Business**: Payment processing

## Roadmap

- [ ] Add more payment providers
- [ ] Support for multiple shipping providers
- [ ] Inventory management features
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support

---

**Built with ❤️ for small businesses in the Philippines**
