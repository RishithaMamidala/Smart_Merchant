# Research: Smart Merchant Command Center

**Date**: 2026-02-03
**Branch**: `001-ecommerce-platform`

## Technology Decisions

### 1. Payment Processing: Stripe

**Decision**: Use Stripe for all payment processing

**Rationale**:
- Industry-leading developer experience with excellent documentation
- Handles PCI compliance - we never touch raw card data
- Built-in support for payment intents (SCA-compliant)
- Webhook support for reliable payment event handling
- Excellent Node.js SDK
- Test mode for development without real transactions

**Alternatives Considered**:
- PayPal: Wider consumer recognition but more complex integration, higher fees for small transactions
- Razorpay: Regional focus (India), not ideal for global scope
- Square: Better for omnichannel, overkill for online-only

**Implementation Notes**:
- Use Stripe Checkout for hosted payment page (simplest, most secure)
- Implement webhook endpoint for `payment_intent.succeeded` and `payment_intent.payment_failed`
- Store Stripe customer ID on Customer model for repeat purchases
- Use Stripe's idempotency keys to prevent duplicate charges

### 2. Email Service: SendGrid

**Decision**: Use SendGrid for all transactional emails

**Rationale**:
- High deliverability rates (97%+)
- Robust API with good error handling
- Dynamic templates support for branded emails
- Detailed analytics for email tracking
- Established reputation, Twilio-backed stability
- Good Node.js SDK

**Alternatives Considered**:
- Resend: Newer, less proven at scale
- AWS SES: Cheapest but requires more setup, IP reputation management
- Mailgun: Similar capabilities but SendGrid has better template editor

**Implementation Notes**:
- Create templates for: Order Confirmation, Shipping Update, Low Stock Alert, Daily Summary
- Use dynamic template data for personalization
- Implement retry logic with exponential backoff for failed sends
- Log all email events for merchant visibility

### 3. Image Storage: Cloudinary

**Decision**: Use Cloudinary for product image storage and delivery

**Rationale**:
- Automatic image optimization (WebP, AVIF)
- On-the-fly transformations (resize, crop, quality adjustment)
- Global CDN for fast delivery
- Generous free tier (25GB storage)
- Easy upload widget for frontend
- Automatic responsive images

**Alternatives Considered**:
- AWS S3 + CloudFront: More control but manual optimization required
- Vercel Blob: Simpler but limited transformation capabilities
- Uploadcare: Good but Cloudinary has better transformation features

**Implementation Notes**:
- Use upload presets for consistent image processing
- Define standard transformations: thumbnail (150x150), card (400x400), detail (800x800)
- Enable eager transformations for common sizes
- Implement client-side upload for better UX (direct to Cloudinary)

### 4. Database: MongoDB Atlas

**Decision**: Use MongoDB Atlas for database hosting

**Rationale**:
- Official MongoDB cloud service with best tooling
- Free tier (M0) suitable for development and initial production
- Built-in monitoring and alerting
- Automatic backups on paid tiers
- Easy connection from Render (both support standard MongoDB connection strings)
- Mongoose ODM provides schema validation and middleware

**Alternatives Considered**:
- Render MongoDB: Native but less mature tooling
- Railway: Good but Atlas has better MongoDB-specific features
- Self-managed: Too much DevOps overhead

**Implementation Notes**:
- Use MongoDB Atlas M0 (free) for development, upgrade to M10 for production
- Enable IP whitelist (allow Render's outbound IPs)
- Create indexes for: product.category, order.status, order.createdAt, variant.sku
- Use MongoDB transactions for checkout (inventory + order atomic)

### 5. Background Jobs: Render Cron Jobs

**Decision**: Use Render Cron Jobs for scheduled tasks

**Rationale**:
- Native to hosting platform (no additional service)
- Simple HTTP-based triggers
- Sufficient for daily summaries and periodic cleanup
- No additional cost on free tier
- Easy to monitor in Render dashboard

**Alternatives Considered**:
- Agenda.js: More powerful but adds complexity
- BullMQ: Requires Redis, overkill for our needs
- QStash: Good but adds another vendor

**Implementation Notes**:
- Create `/api/cron/daily-summary` endpoint (secured with cron secret)
- Schedule: Daily at 23:59 UTC
- Tasks: Generate merchant daily summary, clean up abandoned carts (>7 days), check for failed notifications to retry

### 6. State Management: Redux Toolkit

**Decision**: Use Redux Toolkit for client-side state management

**Rationale**:
- Industry standard with massive ecosystem
- Excellent Redux DevTools for debugging
- Built-in RTK Query option (though using TanStack Query for server state)
- Middleware support for complex async flows
- Predictable state updates with immutable patterns
- Works great with JavaScript and JSDoc annotations

**Alternatives Considered**:
- Zustand: Simpler but less ecosystem and tooling support
- Jotai: Atomic approach, good but less familiar to most developers
- React Context: Insufficient for complex cart/auth state

**Implementation Notes**:
- Store structure: `store/index.js`, `store/slices/`
- Slices: `cartSlice.js`, `authSlice.js`, `merchantSlice.js`
- Use `redux-persist` for cart persistence to localStorage
- Use `createAsyncThunk` for complex async operations
- Clear persisted state on logout

### 7. Styling: Tailwind CSS

**Decision**: Use Tailwind CSS for all styling

**Rationale**:
- Utility-first approach speeds development
- Built-in responsive design utilities
- Excellent for mobile-first development
- Good accessibility defaults (focus states, etc.)
- Tree-shaking removes unused CSS
- Works great with Vite

**Alternatives Considered**:
- CSS Modules: More traditional but slower development
- Styled Components: Runtime overhead, less performant
- Chakra UI: Good components but Tailwind more flexible

**Implementation Notes**:
- Use Tailwind's default design tokens
- Create component classes for repeated patterns
- Use `@headlessui/react` for accessible interactive components (modals, dropdowns)
- Consider `shadcn/ui` for pre-built accessible components

### 8. API Client: TanStack Query

**Decision**: Use TanStack Query (React Query) for server state management

**Rationale**:
- Automatic caching and background refetching
- Built-in loading/error states
- Optimistic updates for better UX
- Automatic retry on failure
- DevTools for debugging
- Works great with JavaScript

**Alternatives Considered**:
- SWR: Similar but TanStack Query has more features
- RTK Query: Tied to Redux
- Plain fetch: Too much boilerplate for caching logic

**Implementation Notes**:
- Create custom query hooks for each entity
- Configure stale time: 30s for products, 0 for cart/orders
- Use mutations for all write operations
- Invalidate queries on relevant mutations

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Payment data | Stripe handles; we never see card numbers |
| Authentication | JWT with httpOnly cookies, short expiry (15min) + refresh tokens |
| CSRF | SameSite cookies + CSRF token for mutations |
| XSS | React's built-in escaping + CSP headers |
| Injection | Mongoose schema validation + express-validator |
| Rate limiting | express-rate-limit on auth and checkout endpoints |
| Secrets | Environment variables only, .env files gitignored |

## Performance Strategy

| Area | Strategy |
|------|----------|
| Images | Cloudinary CDN + lazy loading + responsive srcset |
| API | Response caching headers, MongoDB indexes |
| Frontend | Code splitting by route, Vite's automatic chunking |
| Database | Connection pooling, query projections (select only needed fields) |
| Bundle | Tree shaking, dynamic imports for heavy components |
