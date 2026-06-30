# Review Debo Frontend

Next.js frontend for the e-commerce product review platform.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Features

- Product list fetched from the FastAPI backend
- Product search and rating filter
- Product detail route at `/products/[id]`
- Review submission form with loading, success, and error states
- Automatic refresh after submitting a review
- Customer login/register flow with JWT token storage
- Customer review update/delete dashboard
- Admin panel for products and review moderation
- Responsive Tailwind CSS interface
- TypeScript types for API data

Make sure the backend is running at `http://localhost:8000` before using the app.
