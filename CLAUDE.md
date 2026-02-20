# Ecommerce Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-03

## Active Technologies

- Node.js 20 LTS (backend), JavaScript ES2022+ (both frontend and backend) (001-ecommerce-platform)
- React 18 + Vite 5 + Redux Toolkit + TanStack Query + Tailwind CSS (frontend)
- Express.js 4.x + Mongoose 8.x (backend)
- MongoDB Atlas (database)

## Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   └── utils/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
└── tests/
```

## Commands

```bash
# Backend
cd backend && npm run dev      # Start dev server
cd backend && npm test         # Run tests
cd backend && npm run lint     # Lint code

# Frontend
cd frontend && npm run dev     # Start Vite dev server
cd frontend && npm test        # Run Vitest
cd frontend && npm run lint    # Lint code
```

## Code Style

- JavaScript ES2022+ with JSDoc annotations for type hints
- Use ESLint + Prettier for formatting
- Follow Airbnb JavaScript style guide
- Use JSDoc `@typedef` for complex object shapes
- Prefer async/await over callbacks
- Use destructuring and spread operators

## Third-Party Services

- **Payments**: Stripe
- **Email**: SendGrid
- **Images**: Cloudinary
- **Database**: MongoDB Atlas
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render

## Recent Changes

- 001-ecommerce-platform: Added Node.js 20 LTS with JavaScript ES2022+

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
