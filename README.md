# Buffer

![Buffer cover](cover.png)

**Spend normally. Save automatically.**

Buffer is a financial automation app that puts saving inside everyday spending.

Each time a user spends, Buffer automatically moves a small amount into a separate cushion so users build a rainy-day buffer without changing how they already transact.

## At a Glance

- What it is: a virtual card + wallet experience that saves automatically when users spend
- Why it matters: it helps users build emergency protection passively
- Frontend: React Native, Expo, TypeScript
- Backend: Node.js, Express, Prisma, PostgreSQL
- API: [https://buffer-0sox.onrender.com](https://buffer-0sox.onrender.com)
- Swagger: [https://buffer-0sox.onrender.com/api-docs](https://buffer-0sox.onrender.com/api-docs)
- Figma: [Design](https://www.figma.com/design/lBYn98UohALuIY08CWV4lt/Buffer?node-id=0-1&t=66lB5HAfJgTECPWj-1) | [Prototype](https://www.figma.com/proto/lBYn98UohALuIY08CWV4lt/Buffer?node-id=16-82&p=f&viewport=377%2C241%2C0.14&t=yrydQ7j4ukLQFu41-1&scaling=contain&content-scaling=fixed&starting-point-node-id=16%3A82&page-id=0%3A1)
- Expo demo: `Add your Expo or dev build link here`

## Quick Start

Requirements:

- Node.js `18+`
- npm
- Android Studio emulator or iOS Simulator for mobile testing
- PostgreSQL for the backend

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

- Press `a` for Android
- Press `i` for iOS
- Run `npm run web` for web preview

### Backend API

Create `backend/.env` with:

```env
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret
PORT=3000
INTERSWITCH_CLIENT_ID=your_client_id
INTERSWITCH_CLIENT_SECRET=your_client_secret
INTERSWITCH_BASE_URL=https://sandbox.interswitchng.com
```

Then run:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

## The Problem

The problem is not that people do not want to save.

The problem is that everyday spending rarely builds any protection for emergencies.

In Nigeria, payment access is improving, but financial resilience is still weak. According to EFInA's 2023 financial health data:

- only `16%` of Nigerian adults were financially healthy
- `84%` ran out of money at least once
- `78%` could not raise emergency funds within a week

That is the gap Buffer is built for.

People already spend every day. What is missing is a system that quietly turns those daily transactions into something useful for rainy days.

Research: [EFInA - Beyond Access: Putting Financial Health at the Core of Nigeria's Next Inclusion Strategy](https://efina.org.ng/wp-content/uploads/2025/09/Beyond-Access-Why-Financial-Health-Must-Be-Nigerias-Next-Inclusion-Goal.pdf)

## The Solution

Buffer puts savings inside everyday spending.

Every time a user spends, Buffer automatically moves a small amount into a separate cushion.

So instead of relying on leftover money or saving habits, users build emergency protection as they transact normally.

## How Buffer Works

1. User signs up, completes onboarding, and gets a virtual spending card.
2. User funds the main wallet and spends normally.
3. Buffer automatically saves on each transaction using one of two modes:
   AGBA: save a percentage of every transaction (`1% - 5%`)
   Yakubu: round up to a chosen threshold such as `₦50`, `₦100`, or `₦500`
4. Savings move into the Cushion Wallet and stay available for rainy days.
5. Users can withdraw cushion funds or use them for supported payments.

## Core Logic

- If balance covers purchase + savings, both happen.
- If balance covers only the purchase, the transaction can still go through and savings may be skipped.
- If balance cannot cover the purchase, the transaction is declined.

**Buffer makes saving automatic without blocking spending.**

## Product Screens

| Home                              | Card                               |
| --------------------------------- | ---------------------------------- |
| ![Home screen](design/8-HOME.png) | ![Card screen](design/9-CARDS.png) |

| Transactions                                                | Settings                                   |
| ----------------------------------------------------------- | ------------------------------------------ |
| ![Transactions screen](design/10-TRANSACTION%20HISTORY.png) | ![Settings screen](design/12-SETTINGS.png) |

## Tech Stack

### Mobile

- React Native
- Expo
- TypeScript
- React Navigation
- Redux Toolkit

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Swagger / OpenAPI
- Zod

### Integrations

- Interswitch card and payment flow integration points
- Identity verification flow for onboarding
- Cushion withdrawal and bill payment flows

## Project Structure

```text
buffer/
├── mobile/        # Expo React Native app
├── backend/       # Express + Prisma API
├── design/        # Product UI screens
├── deck/          # Pitch deck slides
├── cover.png
└── README.md
```

## Key Backend Capabilities

- Authentication: `/auth/register`, `/auth/login`
- User setup and profile updates: `/user`
- Wallet funding and balance flows: `/wallet`
- Spending and transaction records: `/transactions`
- Cushion management: `/cushion`
- Virtual card management: `/card`
- Transfers: `/transfers`

## Resources

- Figma Design: [Buffer Design](https://www.figma.com/design/lBYn98UohALuIY08CWV4lt/Buffer?node-id=0-1&t=66lB5HAfJgTECPWj-1)
- Figma Prototype: [Buffer Prototype](https://www.figma.com/proto/lBYn98UohALuIY08CWV4lt/Buffer?node-id=16-82&p=f&viewport=377%2C241%2C0.14&t=yrydQ7j4ukLQFu41-1&scaling=contain&content-scaling=fixed&starting-point-node-id=16%3A82&page-id=0%3A1)
- Pitch Deck Assets: [`deck/`](deck/)
- Swagger Docs: [https://buffer-0sox.onrender.com/api-docs](https://buffer-0sox.onrender.com/api-docs)

## Team

This project was built as a hackathon collaboration across product, design, frontend, and backend.

- Frontend: React Native / Expo
- Backend: API and integrations
- Design: UI/UX and prototype
