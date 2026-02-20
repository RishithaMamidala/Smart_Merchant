# Smart Merchant - Ecommerce Platform

**A full-featured online shopping platform for merchants and customers**

🌐 **Live Demo**: [https://smart-merchant-fawn.vercel.app](https://smart-merchant-fawn.vercel.app)

---

## What is Smart Merchant?

Smart Merchant is a complete ecommerce solution that allows merchants to sell products online and customers to browse and purchase items securely. Think of it like a simplified version of Shopify or Amazon - merchants can manage their inventory, track orders, and receive payments, while customers can shop, add items to their cart, and checkout with credit cards.

## What Can You Do?

### For Customers:
- **Browse Products** - View a catalog of products with images, descriptions, and prices
- **Shopping Cart** - Add items to your cart and manage quantities
- **Secure Checkout** - Pay safely with credit/debit cards via Stripe
- **Order Tracking** - View your order history and status
- **User Accounts** - Register and login to save your information

### For Merchants:
- **Product Management** - Add, edit, and delete products with images
- **Inventory Control** - Track stock levels and get low-stock alerts
- **Order Management** - View and manage customer orders
- **Sales Analytics** - See daily sales summaries and revenue reports
- **Dashboard** - Monitor your business at a glance

## How It's Built

The platform uses modern, reliable technologies:

### Frontend (What You See)
- **React** - Modern JavaScript framework for fast, interactive user interfaces
- **Tailwind CSS** - Clean, responsive design that works on all devices
- **Hosted on Vercel** - Fast, reliable hosting with automatic updates

### Backend (Behind the Scenes)
- **Node.js + Express** - Handles all the business logic and API requests
- **MongoDB Atlas** - Secure cloud database storing all products, orders, and user data
- **Hosted on Render** - Reliable backend server with automatic scaling

### Payment & Services
- **Stripe** - Industry-standard payment processing (supports all major credit cards)
- **SendGrid** - Email notifications for orders and account management
- **Cloudinary** - Fast, optimized image hosting for product photos

## System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Customer  │         │   Merchant  │         │   Admin     │
│   (Browser) │         │   (Browser) │         │   Tools     │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       └───────────────────────┴────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Frontend (React)   │
                    │   Vercel Hosting     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend API (Node)  │
                    │   Render Hosting     │
                    └──────────┬──────────┘
                               │
         ┏─────────────────────┼─────────────────────┓
         │                     │                     │
    ┌────▼────┐         ┌─────▼─────┐        ┌─────▼─────┐
    │ MongoDB │         │   Stripe  │        │ SendGrid  │
    │ Database│         │  Payments │        │   Email   │
    └─────────┘         └───────────┘        └───────────┘
```

## Key Features Implemented

✅ **User Authentication** - Secure login system with JWT tokens
✅ **Product Catalog** - Full product browsing with search and filters
✅ **Shopping Cart** - Real-time cart updates and management
✅ **Stripe Checkout** - Secure payment processing
✅ **Order Management** - Complete order lifecycle tracking
✅ **Email Notifications** - Automated emails for orders and account actions
✅ **Image Uploads** - Product photos stored on Cloudinary CDN
✅ **Merchant Dashboard** - Sales analytics and inventory management
✅ **Mobile Responsive** - Works perfectly on phones, tablets, and desktops
✅ **Security Hardening** - CORS protection, rate limiting, input sanitization
✅ **Automated Tasks** - Daily reports, low-stock alerts, cart cleanup

## Deployment Details

### 🚀 Live URLs

- **Frontend**: [https://smart-merchant-fawn.vercel.app](https://smart-merchant-fawn.vercel.app)
- **Backend API**: [https://smartmerchant-backend.onrender.com](https://smartmerchant-backend.onrender.com)

### 💰 Cost: $0/month (100% Free Tier)

The entire platform runs on free hosting tiers:
- **Vercel Hobby** - Free frontend hosting (100GB bandwidth)
- **Render Free Tier** - Free backend hosting (750 hours/month)
- **MongoDB Atlas M0** - Free database (512MB storage)
- **GitHub Actions** - Free automated tasks (2000 minutes/month)
- **Stripe** - Free to setup (pay per transaction only)

**Note**: The backend on Render's free tier "spins down" after 15 minutes of inactivity to save resources. The first request after this will take 30-60 seconds to "wake up" the server. Subsequent requests are instant.

### 🔒 Security Features

- **HTTPS Everywhere** - All connections encrypted
- **JWT Authentication** - Secure token-based login
- **Rate Limiting** - Prevents API abuse and attacks
- **Input Sanitization** - Protects against injection attacks
- **CORS Protection** - Only allows authorized frontend access
- **Secure Headers** - X-Frame-Options, Content Security Policy, etc.

## How to Use Locally

### Prerequisites
- Node.js 20+ installed
- MongoDB Atlas account (free)
- Stripe account (free test mode)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Ecommerce
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   Create `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret
   STRIPE_SECRET_KEY=your_stripe_test_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   FRONTEND_URL=http://localhost:5173
   ```

   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## Project Structure

```
Ecommerce/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database, environment config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── store/         # Redux state management
│   │   └── utils/         # Helper functions
│   └── package.json
│
├── .github/
│   └── workflows/         # Automated tasks (cron jobs)
│
├── render.yaml            # Backend deployment config
└── README.md             # This file
```

## Testing Payments

For testing the checkout flow, use Stripe's test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any CVC code.

## What's Been Accomplished

This project demonstrates:
- ✅ Full-stack development with modern JavaScript
- ✅ RESTful API design and implementation
- ✅ Database modeling and relationships
- ✅ Secure authentication and authorization
- ✅ Third-party payment integration (Stripe)
- ✅ Cloud deployment and DevOps
- ✅ Email service integration
- ✅ Image storage and CDN usage
- ✅ Responsive UI/UX design
- ✅ Security best practices
- ✅ Automated task scheduling
- ✅ Complete CI/CD pipeline