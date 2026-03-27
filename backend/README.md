# Buffer Backend

Backend API for Buffer, a fintech savings and cushion-wallet experience built for demo and hackathon submission.

## Live Links

- Base API: `https://buffer-0sox.onrender.com`
- Swagger docs: `https://buffer-0sox.onrender.com/api-docs`
- Health check: `https://buffer-0sox.onrender.com/health`

## Hackathon Compliance

This project uses standard frameworks for delivery, but the financial transaction layer is wired around Interswitch sandbox APIs as required by the hackathon brief.

Current Interswitch-backed flows in this backend:

- Bank list retrieval
- Account name resolution
- Wallet-to-bank transfer initiation and status checks
- Cushion withdrawal to bank accounts
- Cushion bill payment
- Payment authorization for transaction simulation

## What This Backend Supports

- User registration and login with JWT authentication
- Profile, KYC verification, and savings settings management
- Main wallet funding and balance retrieval
- Cushion wallet balance, bill payment, withdrawal, and move-to-main flow
- Simulated card payments with automated savings round-up logic
- Virtual card creation, freeze, and unfreeze
- Bank listing, account resolution, and send-money transfer flow
- Transaction history and ledger-backed balance updates

## Stack

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL
- Swagger / OpenAPI

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `DATABASE_URL` in `.env` to point to a running PostgreSQL database.

4. Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

5. Start the API locally:

```bash
npm run dev
```

Local Swagger docs will be available at `http://localhost:3000/api-docs` unless you change `PORT`.

## Environment Variables

See [.env.example](/home/malik/Documents/tecmalik/buffer/backend/.env.example) for the full template.

- `PORT`: API port
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: signing secret for auth tokens
- `JWT_EXPIRES_IN`: token lifetime
- `SALT_ROUNDS`: bcrypt cost factor
- `INTERSWITCH_BASE_URL`: Interswitch sandbox base URL
- `INTERSWITCH_CLIENT_ID`: mock/sandbox provider client id
- `INTERSWITCH_CLIENT_SECRET`: mock/sandbox provider client secret
- `INTERSWITCH_CURRENCY`: transfer currency, default `NGN`

## Interswitch Integration Notes

- The Interswitch client lives in [src/modules/interswitch/interswitch.service.ts](/home/malik/Documents/tecmalik/buffer/backend/src/modules/interswitch/interswitch.service.ts).
- `INTERSWITCH_CURRENCY` should remain `NGN`; kobo is the amount unit, not a separate currency code.
- Transfers use Interswitch institution lookup, account resolution, payout initiation, and payout status endpoints.
- Cushion bill payments and payout withdrawals are routed through the same integration layer.
- Transaction payment simulation calls the Interswitch payment authorization flow.
- Virtual card issuance itself is still mocked in the current backend, but card-driven transaction authorization is routed through the Interswitch client.
- This backend currently accepts user-facing amounts in naira and converts them to kobo before sending requests to Interswitch.

## Demo Flow

For a clean end-to-end demo, this sequence matches the available API:

1. Register a user with `POST /auth/register`
2. Login with `POST /auth/login`
3. Set a transaction PIN with `POST /user/set-transaction-pin`
4. Fund the wallet with `POST /wallet/fund`
5. Update savings mode with `PUT /user/settings`
6. Trigger a round-up via `POST /transactions/pay`
7. Show cushion balance with `GET /cushion`
8. Move funds back or withdraw using `POST /cushion/move-to-main` or `POST /cushion/withdraw`
9. Show transfers with `POST /transfers/send` after resolving an account if needed
10. Show transaction history with `GET /transactions`

For the demo narrative, explicitly call out that steps 6, 8, and 9 are the strongest Interswitch-backed moments because they touch payment authorization, bill payment, and payouts.

## Demo Credentials

This repo does not include seeded login credentials by default. For the demo, either:

- create a fresh account through `POST /auth/register`, or
- add your shared demo account details to the main submitted GitHub README if your team is using a pre-created account
