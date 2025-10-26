# Deployment Guide

This guide covers deploying the Order Management System to production.

## Pre-Deployment Checklist

### 1. Google Sheets
- [ ] Create spreadsheet with Inventory and Orders sheets
- [ ] Add sample products to Inventory
- [ ] Set proper permissions
- [ ] Note the Sheet ID from URL

### 2. Google Apps Script
- [ ] Copy backend code to Apps Script project
- [ ] Set all Script Properties
- [ ] Deploy as web app
- [ ] Test API endpoints
- [ ] Enable API access
- [ ] Copy Web App URL

### 3. Environment Configuration
- [ ] Create `.env` file from `env.example`
- [ ] Fill in all environment variables
- [ ] Generate secure admin token
- [ ] Verify all URLs and IDs

### 4. Frontend
- [ ] Test locally with `npm run dev`
- [ ] Build for production: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Verify all API calls work

### 5. Automation
- [ ] Install Playwright: `npm install -g playwright`
- [ ] Run: `playwright install chromium`
- [ ] Test automation locally
- [ ] Configure `.env` for automation

### 6. Integrations
- [ ] Maya for Business account configured
- [ ] Meta app created and webhook configured
- [ ] J&T Express account ready
- [ ] Email sending works

## Deployment Steps

### Step 1: Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create new project
3. Paste `backend/Code.gs` content
4. Go to Project Settings > Script Properties
5. Add all required properties
6. Click "Deploy" > "New deployment"
7. Type: "Web app"
8. Execute as: "Me"
9. Who has access: "Anyone"
10. Deploy and copy URL

### Step 2: Configure GitHub Repository

1. Create new repository on GitHub
2. Push code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Automatic Deployment

1. Sign up at [Vercel](https://vercel.com)
2. Import GitHub repository
3. Configure project:
   - Framework Preset: Vite
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_APPS_SCRIPT_URL`
   - `VITE_ADMIN_TOKEN`
   - `VITE_MAYA_PUBLIC_KEY`
   - `VITE_META_PAGE_TOKEN`
   - `VITE_SHEET_ID`
5. Deploy

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 4: Deploy to GitHub Pages

The project includes GitHub Actions workflow for automatic deployment.

1. Go to repository Settings > Pages
2. Source: "GitHub Actions"
3. Workflow will trigger on push to main
4. Site will be live at: `https://YOUR_USERNAME.github.io/order-system`

### Step 5: Configure GitHub Secrets

For automation and CI/CD, add secrets in repository Settings > Secrets:

```
APPS_SCRIPT_URL
JNTT_USERNAME
JNTT_PASSWORD
SHOP_NAME
SHOP_CONTACT
SHOP_ADDRESS
SHOP_PROVINCE
SHOP_CITY
SHOP_BARANGAY
```

### Step 6: Set Up Custom Domain (Optional)

If you have a custom domain:

#### For Vercel
1. Go to project settings in Vercel
2. Add domain
3. Update DNS records as instructed

#### For GitHub Pages
1. Add CNAME file to repository root
2. Update DNS settings with your domain provider
3. Wait for DNS propagation

### Step 7: Generate QR Codes

For each product, generate QR code:

```
https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=YOUR_DOMAIN/order?id=PROD-001
```

Update Inventory sheet with QRCodeURL column.

### Step 8: Test Everything

1. **Products Page**: Loads and displays products
2. **Order Flow**: Create test order
3. **Admin Dashboard**: Login and view orders
4. **Payment**: Test payment flow (use test mode)
5. **Email**: Check email notifications
6. **Automation**: Run J&T booking

## Post-Deployment

### Monitoring

1. Check Apps Script execution logs
2. Monitor Vercel deployment logs
3. Set up error tracking (optional)
4. Check email delivery

### Maintenance

1. Update products regularly
2. Monitor stock levels
3. Update shipping information
4. Backup Google Sheets periodically

### Scaling

If traffic increases:

1. Enable caching in Apps Script
2. Add CDN for static assets
3. Optimize images
4. Use Google Cloud SQL (if needed)

## Troubleshooting

### Deployment Failed

- Check build logs
- Verify environment variables
- Test locally first
- Check for syntax errors

### API Not Working

- Verify Apps Script deployment
- Check Script Properties
- Enable API access
- Review execution logs

### Frontend Errors

- Check browser console
- Verify API URL
- Check CORS settings
- Review network tab

### Automation Failing

- Check Playwright install
- Verify J&T credentials
- Update selectors if needed
- Review screenshots

## Security Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Use strong admin token** - Generate with `openssl rand -hex 32`
3. **Limit Apps Script permissions** - Use minimal required scopes
4. **Validate all inputs** - Server-side validation
5. **Use HTTPS** - Always use secure connections
6. **Regular backups** - Export Google Sheets regularly

## Rollback Plan

If deployment goes wrong:

1. **Frontend**: Revert to previous Vercel deployment
2. **Backend**: Redeploy Apps Script from backup
3. **Data**: Restore from Google Sheets version history

## Production Checklist

Before going live:

- [ ] All credentials are secure
- [ ] Environment variables set
- [ ] Frontend deployed and accessible
- [ ] Backend API working
- [ ] Admin dashboard protected
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] QR codes generated
- [ ] Automation tested
- [ ] Custom domain configured (if applicable)
- [ ] Analytics setup (optional)
- [ ] Error tracking setup (optional)
- [ ] Documentation updated
- [ ] Team trained on system

## Support

For deployment issues:
- Check main README
- Review SETUP.md
- Check GitHub issues
- Contact support

## Updates and Maintenance

### Regular Tasks

1. **Weekly**: Check orders, update stock
2. **Monthly**: Review analytics, optimize
3. **Quarterly**: Update dependencies
4. **Yearly**: Security audit

### Updating the System

1. Pull latest changes: `git pull`
2. Update dependencies: `npm install`
3. Test locally
4. Commit changes
5. Push to trigger deployment
6. Monitor deployment logs

---

**Good luck with your deployment!**
