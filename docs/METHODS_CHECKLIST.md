# NOWPayments API – Methods Checklist

All methods from the [official API docs](https://documenter.getpostman.com/view/7907941/2s93JusNJt) vs this package.

## ✅ Payment API (core)

| API Endpoint | Method | Package Method | Status |
|--------------|--------|----------------|--------|
| GET /v1/status | getStatus | `getStatus()` | ✅ |
| GET /v1/currencies | getCurrencies | `getCurrencies()` | ✅ |
| GET /v1/currencies/{currency} | getCurrency | `getCurrency(currency)` | ✅ |
| GET /v1/estimate | getEstimatePrice | `getEstimatePrice(params)` | ✅ |
| GET /v1/min-amount | getMinAmount | `getMinAmount(params)` | ✅ |
| POST /v1/payment | createPayment | `createPayment(params)` | ✅ |
| GET /v1/payment/{id} | getPaymentStatus | `getPaymentStatus(id)` | ✅ |
| GET /v1/payment/ | getPayments | `getPayments(params?)` | ✅ |
| POST /v1/payment/{id}/update-merchant-estimate | updatePaymentEstimate | `updatePaymentEstimate(id)` | ✅ |
| POST /v1/invoice | createInvoice | `createInvoice(params)` | ✅ |
| POST /v1/invoice-payment | createInvoicePayment | `createInvoicePayment(params)` | ✅ |

## ✅ Payout API

| API Endpoint | Method | Package Method | Status |
|--------------|--------|----------------|--------|
| POST /v1/payout | createPayout | `createPayout(params, jwtToken?)` | ✅ |
| POST /v1/payout/{id}/verify | verifyPayout | `verifyPayout(id)` | ✅ |

*Note: `createPayout` requires JWT auth. Pass `jwtToken` as 2nd argument when available.*

## ✅ Recurring Payments (Subscriptions)

| API Endpoint | Method | Package Method | Status |
|--------------|--------|----------------|--------|
| GET /v1/subscriptions | list | `getSubscriptions()` | ✅ |
| GET /v1/subscriptions/{id} | get | `getSubscription(id)` | ✅ |
| DELETE /v1/subscriptions/{id} | cancel | `deleteSubscription(id)` | ✅ |
| GET /v1/subscriptions/plans | list plans | `getSubscriptionPlans()` | ✅ |
| GET /v1/subscriptions/plans/{id} | get plan | `getSubscriptionPlan(id)` | ✅ |
| PATCH /v1/subscriptions/plans/{id} | update plan | `updateSubscriptionPlan(id, updates)` | ✅ |

*Note: Create plan/subscription may be dashboard-only or require separate Mass Payouts/Custody API.*

## ✅ Sub-Partner (Customer Management)

| API Endpoint | Method | Package Method | Status |
|--------------|--------|----------------|--------|
| GET /v1/sub-partner | list | `getSubPartners()` | ✅ |
| GET /v1/sub-partner/balance/{id} | get balance | `getSubPartnerBalance(id)` | ✅ |
| GET /v1/sub-partner/transfers | list | `getTransfers()` | ✅ |
| GET /v1/sub-partner/transfer/{id} | get | `getTransfer(id)` | ✅ |

## Extra (not in standard Payment API)

- **Custody API** – different product, separate integration
- **Mass Payouts API** – may use `@nowpaymentsio/nowpayments-mass-payments-api-js`
- **Fiat Withdrawals** – separate product
- **Create sub-partner / transfer** – POST endpoints, if available, not in main docs

## IPN / Helpers

| Feature | Package | Status |
|---------|---------|--------|
| Verify IPN signature | `verifyIpn()` / `verifyIpnSignature()` | ✅ |
| Create IPN signature (test) | `createIpnSignature()` | ✅ |
| Payment status helpers | `isPaymentComplete()`, `getStatusLabel()`, etc. | ✅ |
