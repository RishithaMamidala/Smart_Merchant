# Quickstart: Smart Merchant Command Center

Get the project running locally in under 10 minutes.

## Prerequisites

- **Node.js** 20 LTS or later
- **npm** 10+ (comes with Node.js)
- **Git**
- **MongoDB Atlas** account (free tier)
- **Stripe** account (test mode)
- **SendGrid** account (free tier)
- **Cloudinary** account (free tier)

## 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-merchant.git
cd smart-merchant

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Set Up External Services

### MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/smartmerchant`

### Stripe (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your **test mode** API keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`
3. Set up webhook (for local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli)):
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret: `whsec_...`

### SendGrid (Email)

1. Go to [SendGrid](https://sendgrid.com)
2. Create an API key with full access
3. Verify a sender email address
4. (Optional) Create dynamic templates for:
   - Order Confirmation
   - Shipping Update
   - Low Stock Alert
   - Daily Summary

### Cloudinary (Images)

1. Go to [Cloudinary](https://cloudinary.com)
2. Get your credentials from the dashboard:
   - Cloud name
   - API Key
   - API Secret
3. Create an upload preset named `smart-merchant-products` (unsigned)

## 3. Configure Environment

### Backend (`backend/.env`)

```bash
# Copy example file
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/smartmerchant

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_REFRESH_SECRET=another-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourstore.com
SENDGRID_FROM_NAME=Smart Merchant

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=your-api-secret

# Cron (for local testing)
CRON_SECRET=local-dev-secret

# Frontend URL (for CORS and emails)
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=smart-merchant-products
```

## 4. Initialize Database

```bash
cd backend

# Run database migrations/seed (if available)
npm run db:seed
```

This creates:
- Sample merchant account: `merchant@example.com` / `password123`
- Sample categories
- Sample products with variants

## 5. Start Development Servers

### Option A: Run separately (two terminals)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Option B: Run together (from root)

```bash
npm run dev
```

## 6. Access the Application

- **Storefront**: http://localhost:5173
- **Merchant Dashboard**: http://localhost:5173/dashboard
- **API**: http://localhost:5000/api

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Merchant | merchant@example.com | password123 |
| Customer | customer@example.com | password123 |

## 7. Test Payment Flow

1. Add products to cart on storefront
2. Go to checkout
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any billing postal code
4. Complete purchase
5. Check merchant dashboard for new order

## Common Issues

### MongoDB connection fails

- Check IP whitelist in Atlas (add your current IP)
- Verify username/password in connection string
- Ensure cluster is active (free tier pauses after inactivity)

### Stripe webhook not working

- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
- Check webhook secret matches `.env`
- Verify endpoint path is correct

### Images not uploading

- Check Cloudinary credentials
- Verify upload preset exists and is unsigned
- Check browser console for CORS errors

### Emails not sending

- Verify SendGrid API key
- Check sender email is verified in SendGrid
- Check SendGrid activity log for errors

## Development Scripts

### Backend

```bash
npm run dev          # Start with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run Vitest
npm run lint         # Run ESLint
```

## Deployment

### Backend → Render

1. Connect GitHub repo to Render
2. Create Web Service:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
3. Add environment variables
4. Deploy

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

### Cron Jobs → Render

1. Create Cron Job in Render
2. Configure:
   - Command: `curl -X POST -H "X-Cron-Secret: $CRON_SECRET" https://your-api.onrender.com/api/cron/daily-summary`
   - Schedule: `59 23 * * *` (daily at 23:59 UTC)

## Next Steps

- [ ] Set up CI/CD with GitHub Actions
- [ ] Configure production environment variables
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure custom domain
- [ ] Enable Stripe live mode for real payments
