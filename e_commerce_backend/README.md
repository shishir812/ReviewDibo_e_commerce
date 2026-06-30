# E-Commerce Review API

FastAPI backend for a product review platform with PostgreSQL, SQLAlchemy, Pydantic validation, Alembic migrations, JWT authentication, CORS, Swagger docs, and seeded products.

## Setup

1. Create and activate the `venv` virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE ecommerce_reviews;
```

4. Copy `.env.example` to `.env` and update `DATABASE_URL`, `JWT_SECRET`, and admin credentials.
5. Run migrations:

```bash
alembic upgrade head
```

6. Start the API:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Swagger docs are available at `http://localhost:8000/docs`.

## API Endpoints

- `GET /api/products` - list products with average rating and review count
- `GET /api/products/{id}` - product details with reviews
- `POST /api/reviews` - create a review and auto-create the named user
- `POST /api/admin/login` - admin JWT login
- `POST /api/products` - admin create product
- `PUT /api/products/{id}` - admin update product
- `DELETE /api/products/{id}` - admin delete product
- `POST /api/products/upload-image` - admin upload product image
- `PUT /api/reviews/{id}` - admin update review rating and comment
- `DELETE /api/reviews/{id}` - admin delete a review
- `POST /api/customers/register` - customer registration with JWT
- `POST /api/customers/login` - customer JWT login
- `GET /api/customers/reviews` - list logged-in customer's reviews
- `PUT /api/customers/reviews/{id}` - customer update own review
- `DELETE /api/customers/reviews/{id}` - customer delete own review

Protected endpoints use `Authorization: Bearer <jwt_token>`.

## Seed Data

On application startup, five sample products are inserted if the products table is empty:
Laptop, Smartphone, Headphones, Smart Watch, and Gaming Chair.
