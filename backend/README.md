# Geypal Backend Local Development Setup

This project includes a starter backend API for the Geypal investment platform. It is intended for local development and testing only, not production banking or payment processing.

## Prerequisites

- Node.js 18+
- npm
- Docker (optional but recommended for MongoDB)

## 1) Install dependencies

From the project root:

```bash
cd backend
npm install
```

## 2) Prepare environment

Copy the example file and update the values:

```bash
cp .env.example .env
```

Use the following local development values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/geypal
JWT_SECRET=geypal_local_dev_secret
JWT_EXPIRE=7d
PAYSTACK_SECRET_KEY=sk_test_your_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
FRONTEND_URL=http://localhost:3000
```

## 3) Start MongoDB locally

If you have Docker installed:

```bash
cd ..
docker compose up -d
```

This starts MongoDB at:

```text
mongodb://localhost:27017/geypal
```

## 4) Run the backend

```bash
cd backend
npm run dev
```

The server should start at:

```text
http://localhost:5000
```

## 5) Health check

Open this URL in the browser or test with curl:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "Backend is running",
  "timestamp": "..."
}
```

## 6) API routes

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/signin`

### User
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `PUT /api/user/bank-details`
- `GET /api/user/dashboard`

### Deposits
- `POST /api/deposit/initialize`
- `GET /api/deposit/verify/:reference`
- `GET /api/deposit/history`

### Withdrawals
- `POST /api/withdraw/request`
- `GET /api/withdraw/history`
- `GET /api/withdraw/amounts`

### Plans
- `GET /api/plans/available`
- `POST /api/plans/invest`
- `GET /api/plans/my-plans`
- `GET /api/plans/:planId`

### Transactions
- `GET /api/transactions`

## 7) Notes

- This is a development setup only.
- It simulates the finance flows but does not replace a live bank or payment provider integration.
- For production, you must add valid Paystack or Flutterwave credentials, deploy the backend, and secure your environment variables.

## 8) Useful commands

```bash
# Start MongoDB
cd .. && docker compose up -d

# Stop MongoDB
cd .. && docker compose down

# Run backend in development mode
cd backend && npm run dev
```
