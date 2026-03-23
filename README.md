# Buffer

**Buffer** is a financial automation app that builds a personal **Safety Net** automatically.

Users spend as they normally would with a **Virtual Spending Card**, and Buffer moves small amounts (based on user settings) aside into a **Cushion Wallet**. These micro-savings grow over time without requiring users to change their behavior. Funds in the Cushion Wallet can be withdrawn anytime or used instantly for essential payments like electricity.

Buffer builds money, shapes behavior, creating a financial buffer for unplanned expenses or recurring necessities.

## Problem Statement

In Nigeria, small amounts of money (₦5–₦50) are often ignored during daily spending, but over time they vanish into impulse purchases. Users frequently face situations where:

- Subscription payments or utilities require lump sums.
- Emergency or planned expenses catch them unprepared.
- They are not broke but are financially unprepared.

**Buffer solves this problem** by automatically accumulating small amounts from everyday spending into a dedicated reserve, creating a **ready-to-use financial cushion**.

## Core Concept

1. **Virtual Spending Card** – powered by Interswitch Card360 API.
2. **Automated Micro-Savings** – based on transaction amounts, moved to the Cushion Wallet.
3. **Cushion Wallet (Safety Net)** – transparent ledger showing total saved, used, and available for withdrawal or instant payments.
4. **Two Saving Modes**:
   - **AGBA Mode** – Percentage-based saving (1–5%) of each transaction.
   - **Yakubu Mode** – Round-up saving (nearest ₦50, ₦100, or ₦500) per transaction.

## Technical Implementation

**Frontend:** React Native / Expo

- Screens: Onboarding, Dashboard, Transaction, Cushion, Profile
- Services: `API calls` (Card360, BillPay, Identity)
- Hooks / utils: Cushion calculations, notifications

**Backend:** Java Spring Boot (or any backend)

- Routes for transactions, balance, user management
- Integrates with Interswitch APIs

### API Integration Points

| API                  | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| Interswitch Card360  | Issue/manage virtual spending card                       |
| Interswitch BillPay  | Pay utilities, airtime, healthcare directly from Cushion |
| Interswitch Identity | BVN/NIN verification for KYC                             |
| DB                   | Ledger and user data storage                             |
