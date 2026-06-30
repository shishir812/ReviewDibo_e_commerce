# Review Debo E-Commerce Review Platform

Full-stack product review platform built with Next.js, FastAPI, PostgreSQL, SQLAlchemy, and JWT authentication.

## Submission Links

- GitHub repository URL: add your GitHub repository link here
- Live frontend URL: add your deployed Next.js URL here
- Live backend API URL: add your deployed FastAPI URL here
- Swagger/OpenAPI documentation: `http://localhost:8000/docs` locally, or add your deployed `/docs` URL here

## Features

- Product gallery with responsive product cards
- Product search and rating filter
- Product details page with average rating and review list
- Review submission form with validation, loading, success, and error states
- Customer register/login with JWT authentication
- Customer review management: update and delete own reviews
- Admin login with JWT authentication
- Admin product management: add, update, delete, image upload
- Admin review moderation: view and delete inappropriate reviews
- Professional delete confirmation modals
- PostgreSQL database with Alembic migrations
- FastAPI Swagger/OpenAPI documentation

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: FastAPI, Python, SQLAlchemy ORM, Pydantic
- Database: PostgreSQL
- Authentication: JWT bearer tokens
- Migrations: Alembic

## Local Setup

### Backend

```bash
cd e_commerce_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a PostgreSQL database:

```sql
CREATE DATABASE ecommerce_reviews;
```

Copy and update the environment file:

```bash
copy .env.example .env
```

Required backend environment variables:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ecommerce_reviews
FRONTEND_URL=http://localhost:3000
PROJECT_NAME=E-Commerce Review API
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=change-this-review-dibo-jwt-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Run database migrations and start the API:

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.
Swagger docs are available at `http://localhost:8000/docs`.

### Frontend

```bash
cd e_commerce_frontend
npm install
copy .env.example .env.local
npm run dev
```

Required frontend environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Frontend runs at `http://localhost:3000`.

## Database Migration / Schema

Alembic migrations are in:

```text
e_commerce_backend/alembic/versions
```

Current schema includes:

- `users`: `id`, `name`, `email`, `password_hash`, `created_at`
- `products`: `id`, `title`, `description`, `image_url`, `created_at`
- `reviews`: `id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`

Run migrations with:

```bash
cd e_commerce_backend
alembic upgrade head
```

## API Overview

- `GET /api/products` - list products with average rating and review count
- `GET /api/products/{id}` - product details with reviews
- `POST /api/reviews` - create review
- `PUT /api/reviews/{id}` - admin update review
- `DELETE /api/reviews/{id}` - admin delete review
- `POST /api/admin/login` - admin JWT login
- `POST /api/customers/register` - customer registration
- `POST /api/customers/login` - customer JWT login
- `GET /api/customers/reviews` - customer review list
- `PUT /api/customers/reviews/{id}` - customer update own review
- `DELETE /api/customers/reviews/{id}` - customer delete own review

Protected endpoints use:

```http
Authorization: Bearer <jwt_token>
```

## Assessment Checklist

- FastAPI REST API: complete
- PostgreSQL + SQLAlchemy ORM: complete
- Product, User, Review models: complete
- Product list and detail APIs: complete
- Review create, update, delete APIs: complete
- Next.js responsive frontend: complete
- Product cards, detail page, review form: complete
- Loading and error handling: complete
- JWT authentication bonus: complete
- Admin panel bonus: complete
- Search and rating filter bonus: complete
- `.env.example`: complete
- Migration/schema: complete
- Swagger/OpenAPI docs: complete
