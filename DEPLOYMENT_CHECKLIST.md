# Deployment Checklist - 100% Free ($0/month)

This is a step-by-step checklist to deploy your ecommerce app to Vercel (frontend) and Render (backend) using only free tiers.

## ✅ Pre-Deployment Setup

### 1. Generate Production Secrets

Run these commands and **save the outputs** (you'll need them later):

```bash
# Generate JWT_SECRET (64 chars)
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET (64 chars)
node -e "console.log('JWT_REFRESH_SECRET:', require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET (32 chars)
node -e "console.log('CRON_SECRET:', require('crypto').randomBytes(16).toString('hex'))"
```

### 2. Gather Your Credentials

Have these ready:

- [ ] **MongoDB Atlas URI**: `mongodb+srv://...` (from your `.env` file or Atlas dashboard)
- [ ] **Stripe Secret Key**: `sk_test_...` or `sk_live_...` (from Stripe dashboard)
- [ ] **SendGrid API Key**: `SG.xxxxx` (from SendGrid dashboard)
- [ ] **SendGrid From Email**: Your verified sender email
- [ ] **Generated secrets** from step 1 above

---

## 🚀 Step 1: Deploy Backend to Render (30-45 min)

### A. Push to GitHub

```bash
# Make sure all deployment files are committed
git add render.yaml frontend/vercel.json .github/workflows/cron-jobs.yml
git commit -m "Add deployment configurations for Vercel and Render"
git push origin main
```

### B. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Sign up or log in (use GitHub account for easier connection)
3. Click **"New +"** → **"Blueprint"**
4. Click **"Connect a repository"**
5. Authorize GitHub and select your repository
6. Click **"Connect"**
7. Render will auto-detect `render.yaml` ✅

### C. Set Environment Variables

Render will show variables marked `sync: false`. Set these **9 required variables**:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas dashboard → Connect → Drivers |
| `JWT_SECRET` | 64-char hex from step 1 | Copy from terminal output |
| `JWT_REFRESH_SECRET` | 64-char hex from step 1 | Copy from terminal output |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | **Leave blank for now** (set after step 3) |
| `SENDGRID_API_KEY` | `SG.xxxxx` | SendGrid dashboard → Settings → API Keys |
| `SENDGRID_FROM_EMAIL` | `your-email@example.com` | Your verified SendGrid sender |
| `CRON_SECRET` | 32-char hex from step 1 | Copy from terminal output |
| `FRONTEND_URL` | **Leave blank for now** | Will set after Vercel deployment |

> **Note**: Leave Cloudinary variables empty (they're optional)

### D. Deploy

1. Click **"Apply"** or **"Create Blueprint Instance"**
2. Wait for build (~3-5 minutes)
3. **Copy your backend URL**: `https://smartmerchant-backend.onrender.com`
4. Test health check: Visit `https://YOUR-BACKEND-URL/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

## 🎨 Step 2: Deploy Frontend to Vercel (15-20 min)

### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Go to frontend directory
cd frontend

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - What's your project's name? smartmerchant-frontend
# - In which directory is your code located? ./ (press Enter)
# - Want to modify settings? N

# Wait for deployment (~2-3 minutes)
```

### Set Environment Variables in Vercel CLI

```bash
# Still in frontend directory

# 1. Set backend API URL (use YOUR backend URL from Render)
vercel env add VITE_API_URL production
# Enter: https://YOUR-BACKEND-URL.onrender.com/api

# 2. Set Stripe publishable key
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_test_... (from Stripe dashboard)

# 3. Optional: Cloudinary (skip if not using)
vercel env add VITE_CLOUDINARY_CLOUD_NAME production
# Enter: your-cloud-name (or leave blank)

vercel env add VITE_CLOUDINARY_UPLOAD_PRESET production
# Enter: smart-merchant-products (or leave blank)
```

### Deploy to Production

```bash
# Deploy to production with environment variables
vercel --prod

# Copy your frontend URL: https://smartmerchant-frontend.vercel.app
```

### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Add environment variables:
   - `VITE_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
6. Click **"Deploy"**
7. Wait ~2-3 minutes
8. **Copy your frontend URL**: `https://YOUR-PROJECT.vercel.app`

---

## 🔗 Step 3: Connect Frontend & Backend (5 min)

### Update Backend CORS

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **smartmerchant-backend** service
3. Click **"Environment"** tab on the left
4. Find `FRONTEND_URL` variable
5. Set value to: `https://YOUR-FRONTEND-URL.vercel.app` (no trailing slash)
6. Click **"Save Changes"**
7. Render will automatically redeploy (~3-5 min)

### Test the Connection

Visit your frontend URL and verify:
- [ ] Homepage loads
- [ ] Products display
- [ ] Can open product details
- [ ] Can register/login
- [ ] No CORS errors in browser console (F12)

---

## 💳 Step 4: Configure Stripe Webhooks (10 min)

### Create Webhook in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://YOUR-BACKEND-URL.onrender.com/api/webhooks/stripe`
4. Click **"Select events"**
5. Select these 3 events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
6. Click **"Add events"**
7. Click **"Add endpoint"**

### Get Webhook Secret

1. Click on your newly created endpoint
2. Click **"Reveal"** under **"Signing secret"**
3. Copy the secret (starts with `whsec_`)

### Update Render Environment Variable

1. Go back to Render dashboard
2. Click on your backend service → **"Environment"**
3. Find `STRIPE_WEBHOOK_SECRET`
4. Set value to: `whsec_...` (paste your webhook secret)
5. Click **"Save Changes"**
6. Render will redeploy (~3-5 min)

### Test Webhook

Complete a test checkout on your frontend using Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

Check Stripe dashboard → Webhooks → Events to verify webhook was received.

---

## ⏰ Step 5: Configure Free Cron Jobs (10 min)

### Set up GitHub Actions Secrets

1. Go to your **GitHub repository**
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Click **"New repository secret"**
4. Add two secrets:

**Secret 1:**
- Name: `BACKEND_URL`
- Value: `https://YOUR-BACKEND-URL.onrender.com` (no trailing slash, no /api)

**Secret 2:**
- Name: `CRON_SECRET`
- Value: Your 32-char CRON_SECRET from Step 1

5. Click **"Add secret"** for each

### Verify Cron Jobs

1. Go to **"Actions"** tab in GitHub
2. You should see **"Scheduled Cron Jobs"** workflow
3. Click on it
4. Click **"Run workflow"** → **"Run workflow"** to test manually
5. Wait ~30 seconds
6. Check Render logs to verify the cron endpoint was called

> **Note**: Cron jobs will run automatically on schedule. Uses ~100 min/month (well under 2000 min free tier).

---

## 🔥 Step 6: Keep Backend Warm (5 min)

Since Render free tier spins down after 15 min, use UptimeRobot to keep it warm:

### Set up UptimeRobot (Free)

1. Sign up at [UptimeRobot](https://uptimerobot.com/)
2. Click **"+ Add New Monitor"**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Smart Merchant Backend
   - **URL**: `https://YOUR-BACKEND-URL.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
4. Click **"Create Monitor"**

This pings your backend every 5 minutes, preventing cold starts!

---

## ✅ Final Verification Checklist

Visit your frontend URL and test everything:

### Authentication
- [ ] Customer registration works
- [ ] Customer login works
- [ ] Merchant login works
- [ ] Logout works
- [ ] Token refresh works (stay logged in for 15+ min)

### Shopping Flow
- [ ] Browse products
- [ ] View product details
- [ ] Add to cart
- [ ] View cart
- [ ] Update cart quantities
- [ ] Proceed to checkout
- [ ] Complete Stripe payment (test card: `4242 4242 4242 4242`)
- [ ] Order confirmation shows
- [ ] Check order status works

### Merchant Features
- [ ] Merchant dashboard loads
- [ ] Can view analytics
- [ ] Can create/edit products
- [ ] Can view orders
- [ ] Real-time notifications work

### Backend Health
- [ ] Visit `https://YOUR-BACKEND-URL.onrender.com/api/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`
- [ ] Check Render logs for errors
- [ ] Verify MongoDB connection in logs

### Webhooks & Cron
- [ ] Stripe webhook events appear in Stripe dashboard
- [ ] GitHub Actions shows successful cron job runs
- [ ] No errors in Render logs from cron jobs

---

## 📊 Deployment Summary

### What's Deployed

| Service | Platform | Plan | Cost |
|---------|----------|------|------|
| Frontend | Vercel | Hobby | **$0/month** |
| Backend | Render | Free | **$0/month** |
| Database | MongoDB Atlas | M0 | **$0/month** |
| Cron Jobs | GitHub Actions | Free | **$0/month** |
| Uptime Monitor | UptimeRobot | Free | **$0/month** |
| Email | SendGrid | Free | **$0/month** (100 emails/day) |
| Images | Cloudinary | Free | **$0/month** (25GB) |
| Payments | Stripe | Free | **$0** (2.9% + $0.30 per transaction) |

### **Total: $0/month** 🎉

### Your URLs

- **Frontend**: `https://YOUR-PROJECT.vercel.app`
- **Backend**: `https://YOUR-BACKEND.onrender.com`
- **API**: `https://YOUR-BACKEND.onrender.com/api`
- **Health Check**: `https://YOUR-BACKEND.onrender.com/api/health`

---

## 🔧 Troubleshooting

### Issue: CORS errors in browser console

**Solution:**
1. Verify `FRONTEND_URL` in Render exactly matches your Vercel URL
2. No trailing slashes
3. Redeploy backend after changing environment variables

### Issue: Backend returns 502/503 errors

**Cause**: Backend is spinning up (cold start on free tier)
**Solution**: Wait 30-60 seconds and try again

### Issue: Stripe payments fail

**Check:**
1. Stripe webhook secret is set correctly in Render
2. Webhook endpoint is active in Stripe dashboard
3. Using test card: `4242 4242 4242 4242`

### Issue: MongoDB connection timeout

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (`0.0.0.0/0`)
4. Click "Confirm"

---

## 🎯 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Monitor free tier limits (SendGrid: 100 emails/day, MongoDB: 512MB storage)
- [ ] Test thoroughly before sharing with users
- [ ] Set up error monitoring with Sentry (free tier available)
- [ ] Consider upgrading Render to Starter ($7/month) for no cold starts

---

## 📚 Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [SendGrid Dashboard](https://app.sendgrid.com/)
- [GitHub Actions](https://github.com/YOUR-USERNAME/YOUR-REPO/actions)
- [UptimeRobot](https://uptimerobot.com/dashboard)

---

**Need help?** Check the full deployment plan in `C:\Users\rishi\.claude\plans\inherited-launching-robin.md`
