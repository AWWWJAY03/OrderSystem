# Project Overview

## What This Is

A complete, production-ready order management system for small businesses in the Philippines. Built with modern web technologies and deployed using free services.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    (React + TailwindCSS)                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │ Product Grid │  │  Order Form  │  │ Admin Dashboard  │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (API)                           │
│                   Google Apps Script                         │
│                                                               │
│  • Product Management                                        │
│  • Order Processing                                          │
│  • Payment Confirmation                                      │
│  • Messenger Webhook                                         │
│  • Email Notifications                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Read/Write
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                               │
│                     Google Sheets                            │
│                                                               │
│  Inventory Sheet: Products, Stock, Prices, QR Codes          │
│  Orders Sheet: All order data, tracking, status              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    AUTOMATION                                │
│              (Node.js + Playwright)                          │
│                                                               │
│  • Login to J&T Express                                      │
│  • Fill booking form                                         │
│  • Extract tracking number                                   │
│  • Update Google Sheets                                       │
│  • Send notifications                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
                   J&T Express Portal
```

## File Structure

```
order-system/
├── src/                          # Frontend React application
│   ├── components/              # Reusable components
│   │   └── Navbar.jsx          # Navigation bar
│   ├── pages/                  # Page components
│   │   ├── ProductGrid.jsx     # Product listing page
│   │   ├── OrderForm.jsx       # Order form page
│   │   ├── Success.jsx         # Order success page
│   │   └── AdminDashboard.jsx  # Admin dashboard
│   ├── services/               # Service modules
│   │   ├── api.js             # API client
│   │   ├── config.js          # Configuration
│   │   ├── paymentService.js  # Payment handling
│   │   └── qrService.js       # QR code generation
│   ├── App.jsx                # Main app component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── backend/                    # Google Apps Script code
│   └── Code.gs               # Backend API implementation
│
├── automation/                 # J&T automation
│   ├── jt_booking.js         # Playwright automation script
│   └── package.json          # Automation dependencies
│
├── .github/workflows/         # CI/CD pipelines
│   ├── deploy.yml            # Frontend deployment
│   └── automation.yml        # Automation runner
│
├── Configuration Files
│   ├── package.json          # Project dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── tailwind.config.js    # TailwindCSS configuration
│   └── env.example           # Environment variables template
│
├── Documentation
│   ├── README.md             # Main documentation
│   ├── SETUP.md              # Detailed setup guide
│   ├── DEPLOYMENT.md         # Deployment instructions
│   ├── CONTRIBUTING.md       # Contribution guidelines
│   ├── CHANGELOG.md          # Version history
│   └── PROJECT_OVERVIEW.md   # This file
│
└── setup.sh                   # Quick setup script
```

## Key Features

### 1. Customer-Facing Features

- **Product Catalog**: Browse products with images, prices, and stock status
- **QR Code Ordering**: Scan QR codes to order via Messenger/Instagram
- **Dynamic Address Forms**: Philippine address dropdowns (Province/City/District/Barangay)
- **Multiple Payment Methods**: Maya and GCash support
- **Order Tracking**: Receive tracking number via email
- **Mobile-First Design**: Works seamlessly on mobile devices

### 2. Admin Features

- **Dashboard**: View all orders in one place
- **Search & Filter**: Find orders by status, date, customer
- **Bulk Actions**: Process multiple orders at once
- **Quick Actions**: Mark paid, mark shipped, book J&T, send email
- **Export Data**: Download orders as CSV
- **Action Logs**: Track admin actions
- **Secure Access**: Token-based authentication

### 3. Automation Features

- **J&T Booking**: Automate shipping booking
- **Single or Bulk**: Process one or many orders
- **Tracking Extraction**: Automatically capture tracking numbers
- **Email Notifications**: Send booking confirmations
- **Error Handling**: Retry and logging capabilities

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Styling | TailwindCSS | Styling |
| Build | Vite | Build tool |
| Backend | Google Apps Script | Serverless API |
| Database | Google Sheets | Data storage |
| Automation | Playwright | Browser automation |
| Deployment | Vercel/GitHub Pages | Hosting |
| CI/CD | GitHub Actions | Automation |

## Integration Points

1. **Frontend → Backend**: REST API calls to Apps Script
2. **Backend → Database**: Google Sheets read/write
3. **Automation → Backend**: API calls to get/update orders
4. **Automation → J&T**: Browser automation for booking
5. **Backend → Email**: Gmail API for notifications
6. **Backend → Meta**: Graph API for Messenger/Instagram

## Data Flow

### Order Creation Flow

1. Customer places order on website
2. Frontend calls `createOrder` API
3. Apps Script adds order to Google Sheets
4. Stock is decremented automatically
5. Order ID returned to customer
6. Customer redirected to success page
7. Payment instructions shown

### Payment Confirmation Flow

1. Customer completes payment (Maya/GCash)
2. Payment provider sends webhook to Apps Script
3. Apps Script validates payment
4. Order marked as "Paid" in Google Sheets
5. Tracking number generated
6. Confirmation email sent to customer
7. Order status updated to "Ready to Ship"

### Shipping Flow

1. Admin marks order ready to ship
2. Admin triggers J&T booking
3. Playwright automation starts
4. Automates J&T booking process
5. Captures tracking number
6. Updates Google Sheets
7. Email sent to customer with tracking

## Security

- Admin token authentication
- Script Properties for sensitive data
- HTTPS for all connections
- CORS configured properly
- Input validation on backend
- No credentials in code

## Scalability

- **Google Sheets**: Up to 10 million cells
- **Apps Script**: 6-minute execution limit (sufficient for most operations)
- **Frontend**: Static hosting, CDN caching
- **Automation**: Can run on-demand or scheduled

## Costs

All components are **free** to use:

- ✅ Google Sheets: Free
- ✅ Google Apps Script: Free
- ✅ Vercel: Free tier
- ✅ GitHub Pages: Free
- ✅ GitHub Actions: Free (2000 minutes/month)
- ✅ Playwright: Free

**Optional paid services**:
- Maya for Business: Transaction fees apply
- Meta Ads: If using for marketing
- Custom domain: ~$10-15/year

## Performance

- **Frontend**: Static hosting, fast load times
- **Backend**: Serverless, scales automatically
- **Database**: Google Sheets, fast for small-medium businesses
- **Automation**: Runs on-demand, async

## Limitations

1. **Google Sheets**: Not suitable for very high traffic (1000+ orders/day)
2. **Apps Script**: 6-minute execution limit
3. **J&T Automation**: May break if J&T UI changes
4. **Messenger Bot**: Basic NLP (can be enhanced)

## Extension Ideas

1. **Inventory Management**: Restocking alerts, low stock warnings
2. **Analytics Dashboard**: Sales reports, charts, insights
3. **Multi-channel**: Add Shopee, Lazada integration
4. **Multi-vendor**: Support for multiple sellers
5. **Loyalty Program**: Points, discounts, rewards
6. **Mobile App**: React Native app
7. **AI Assistant**: Better customer support
8. **Advanced Automation**: Auto-fulfillment, auto-cancellation

## Support

For questions or issues:
- Check README.md for overview
- See SETUP.md for installation
- Review DEPLOYMENT.md for deployment
- Open GitHub issue for bugs
- Start discussion for questions

## Getting Started

1. Read README.md
2. Follow SETUP.md
3. Configure your environment
4. Deploy using DEPLOYMENT.md
5. Start accepting orders!

---

**Built with ❤️ for small businesses in the Philippines**
